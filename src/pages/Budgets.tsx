import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonModal, IonButton, IonIcon, IonToast, IonAlert
} from '@ionic/react';
import { addOutline, closeOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { useState, useRef } from 'react';
import { useCategories, useBudgets, useSettings } from '../hooks/useStorage';
import { setBudget, deleteBudget, deleteCategory, getCategorySpend, getCurrentMonth } from '../store/storage';
import styles from './Budgets.module.css';

const Budgets: React.FC = () => {
  const { categories, refresh: refreshCategories } = useCategories();
  const { budgets, refresh } = useBudgets();
  const { settings } = useSettings();
  const sym = settings.currencySymbol;
  const month = getCurrentMonth();
  const modal = useRef<HTMLIonModalElement>(null);

  const [selectedCatId, setSelectedCatId] = useState('food');
  const [limitInput, setLimitInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.id !== 'income');

  const handleSaveBudget = () => {
    const parsed = parseFloat(limitInput);
    if (!limitInput || isNaN(parsed) || parsed <= 0) {
      setToastMsg('Please enter a valid amount');
      setShowToast(true);
      return;
    }
    setBudget({ categoryId: selectedCatId, limit: parsed, month });
    refresh();
    modal.current?.dismiss();
    setLimitInput('');
  };

  const handleDeleteBudget = (categoryId: string) => {
    deleteBudget(categoryId, month);
    refresh();
  };

  const handleDeleteCategory = () => {
    if (!deletingCatId) return;
    deleteBudget(deletingCatId, month);
    deleteCategory(deletingCatId);
    refresh();
    refreshCategories();
    setDeletingCatId(null);
  };

  const openModal = (catId?: string) => {
    const firstCat = expenseCategories[0]?.id || 'food';
    if (catId) {
      setSelectedCatId(catId);
      const existing = budgets.find(b => b.categoryId === catId && b.month === month);
      setLimitInput(existing ? String(existing.limit) : '');
    } else {
      setSelectedCatId(firstCat);
      setLimitInput('');
    }
    modal.current?.present();
  };

  const monthLabel = new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const totalBudgeted = budgets.filter(b => b.month === month).reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.filter(b => b.month === month).reduce((s, b) => s + getCategorySpend(b.categoryId, month), 0);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Budgets
          </IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => openModal()}>
            <IonIcon icon={addOutline} style={{ color: 'var(--accent-light)', fontSize: 24 }} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={styles.wrap}>
          <p className={styles.monthLabel}>{monthLabel}</p>

          {budgets.filter(b => b.month === month).length > 0 && (
            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Budgeted</p>
                <p className={`amount ${styles.summaryVal}`}>{sym}{totalBudgeted.toFixed(2)}</p>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Spent</p>
                <p className={`amount ${styles.summaryVal}`} style={{ color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {sym}{totalSpent.toFixed(2)}
                </p>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryLabel}>Remaining</p>
                <p className={`amount ${styles.summaryVal}`} style={{ color: totalBudgeted - totalSpent < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {sym}{(totalBudgeted - totalSpent).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="section-title">Category budgets</p>
            {expenseCategories.map(cat => {
              const budget = budgets.find(b => b.categoryId === cat.id && b.month === month);
              const spent = getCategorySpend(cat.id, month);
              const pct = budget ? Math.min((spent / budget.limit) * 100, 100) : 0;
              const over = budget ? spent > budget.limit : false;

              return (
                <div key={cat.id} className="card" style={{ marginBottom: 8 }}>
                  <div className={styles.budgetRow}>
                    <div className={styles.catIcon} style={{ background: cat.color + '22', color: cat.color }}>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.budgetMeta}>
                        <span className={styles.catName}>{cat.name}</span>
                        <div className={styles.budgetActions}>
                          {budget ? (
                            <>
                              <span className={`amount ${styles.budgetAmt}`} style={{ color: over ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                {sym}{spent.toFixed(2)} / {sym}{budget.limit.toFixed(2)}
                              </span>
                              <button className={styles.iconBtn} onClick={() => openModal(cat.id)} title="Edit budget">
                                <IonIcon icon={addOutline} />
                              </button>
                              <button className={styles.iconBtn} onClick={() => handleDeleteBudget(cat.id)} style={{ color: 'var(--warning)' }} title="Remove limit">
                                <IonIcon icon={closeOutline} />
                              </button>
                            </>
                          ) : (
                            <button className={styles.setBtn} onClick={() => openModal(cat.id)}>
                              Set limit
                            </button>
                          )}
                          <button
                            className={styles.iconBtn}
                            style={{ color: 'var(--danger)', marginLeft: 2 }}
                            onClick={() => setDeletingCatId(cat.id)}
                            title="Delete category"
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                      {budget && (
                        <div className="progress-bar" style={{ marginTop: 8 }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : cat.color }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <IonModal ref={modal} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
          <IonHeader className="ion-no-border">
            <IonToolbar style={{ '--background': 'var(--bg-secondary)' }}>
              <IonButton slot="start" fill="clear" onClick={() => modal.current?.dismiss()}>
                <IonIcon icon={closeOutline} style={{ color: 'var(--text-secondary)' }} />
              </IonButton>
              <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>Set Budget</IonTitle>
              <IonButton slot="end" fill="clear" onClick={handleSaveBudget}>
                <IonIcon icon={checkmarkOutline} style={{ color: 'var(--accent-light)' }} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent style={{ '--background': 'var(--bg-secondary)' }}>
            <div className={styles.modalWrap}>
              <div>
                <p className="section-title">Category</p>
                <div className={styles.categoryGrid}>
                  {expenseCategories.map(cat => (
                    <button
                      key={cat.id}
                      className={`${styles.catBtn} ${selectedCatId === cat.id ? styles.catBtnActive : ''}`}
                      style={selectedCatId === cat.id ? { borderColor: cat.color, background: cat.color + '22' } : {}}
                      onClick={() => setSelectedCatId(cat.id)}
                    >
                      <span style={{ color: cat.color, fontSize: 20 }}></span>
                      <span className={styles.catBtnLabel}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="section-title">Monthly limit</p>
                <input
                  className={styles.limitInput}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={limitInput}
                  onChange={e => setLimitInput(e.target.value)}
                />
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={!!deletingCatId}
          header="Delete category?"
          message="This removes the category permanently. Existing transactions will not be deleted."
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setDeletingCatId(null) },
            { text: 'Delete', role: 'destructive', handler: handleDeleteCategory }
          ]}
          onDidDismiss={() => setDeletingCatId(null)}
        />

        <IonToast isOpen={showToast} message={toastMsg} duration={2000} onDidDismiss={() => setShowToast(false)} color="danger" />
      </IonContent>
    </IonPage>
  );
};

export default Budgets;
