import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButton, IonIcon, IonToast
} from '@ionic/react';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';

import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCategories, useSettings } from '../hooks/useStorage';
import { addTransaction } from '../store/storage';
import styles from './AddTransaction.module.css';

const AddTransaction: React.FC = () => {
  const history = useHistory();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('food');
  const [note, setNote] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setToastMsg('Please enter a valid amount');
      setShowToast(true);
      return;
    }
    addTransaction({
      type: mode === 'income' ? 'income' : 'expense',
      amount: parsed,
      categoryId,
      note: mode === 'income' && source ? `${source}${note ? ' — ' + note : ''}` : note,
      date,
    });
    history.goBack();
  };

  const expenseCategories = categories.filter(c => c.id !== 'income');
  const incomeCategories = categories.filter(c => c.id === 'income' || c.id === 'other' || c.id === 'savings');
  const visibleCategories = mode === 'income' ? incomeCategories : expenseCategories;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButton className={styles.modalCloseBtn} slot="start" fill="clear" onClick={() => history.goBack()}>
            <IonIcon icon={closeOutline} style={{ color: 'var(--text-secondary)', fontSize: 24 }} />
          </IonButton>
          <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600}}>
            Add Transaction
          </IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleSave}>
            <IonIcon icon={checkmarkOutline} style={{ color: 'var(--accent-light)', fontSize: 24 }} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={styles.wrap}>

          <div className={styles.typeToggle}>
            <button
              className={`${styles.typeBtn} ${mode === 'expense' ? styles.typeBtnActive : ''}`}
              style={mode === 'expense' ? { background: 'var(--danger-dim)', color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
              onClick={() => { setMode('expense'); setCategoryId('food'); }}
            >
              Expense
            </button>
            <button
              className={`${styles.typeBtn} ${mode === 'income' ? styles.typeBtnActive : ''}`}
              style={mode === 'income' ? { background: 'var(--success-dim)', color: 'var(--success)', borderColor: 'var(--success)' } : {}}
              onClick={() => { setMode('income'); setCategoryId('income'); }}
            >
              Income
            </button>
          </div>

          <div className={styles.amountWrap}>
            <span className={styles.currencySymbol}>{settings.currencySymbol}</span>
            <input
              className={styles.amountInput}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {mode === 'income' && (
            <div>
              <p className="section-title">Source</p>
              <input
                className={styles.noteInput}
                type="text"
                placeholder="e.g. Client name, employer, freelance project…"
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>
          )}

          <div>
            <p className="section-title">Category</p>
            <div className={styles.categoryGrid}>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.catBtn} ${categoryId === cat.id ? styles.catBtnActive : ''}`}
                  style={categoryId === cat.id ? { borderColor: cat.color, background: cat.color + '22' } : {}}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <span className={styles.catBtnIcon} style={{ color: cat.color }}>
                  </span>
                  <span className={styles.catBtnLabel}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-title">Note</p>
            <input
              className={styles.noteInput}
              type="text"
              placeholder="Any additional details…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div>
            <p className="section-title">Date</p>
            <input
              className={styles.noteInput}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>
            Save Transaction
          </button>
        </div>

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setShowToast(false)}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddTransaction;
