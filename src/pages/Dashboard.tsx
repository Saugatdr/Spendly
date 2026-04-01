import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonFab, IonFabButton, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDashboard } from '../hooks/useStorage';
import { getCategories } from '../store/storage';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { income, expenses, balance, monthTransactions, categoryStats, settings } = useDashboard();
  const sym = settings.currencySymbol;
  const categories = getCategories();

  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;
  const recentTx = monthTransactions.slice(0, 5);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Spendly
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => { e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div className={styles.wrap}>
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Total balance</p>
            <p className={styles.balanceAmount}>{fmt(balance)}</p>
            <div className={styles.balanceRow}>
              <div className={styles.balanceStat}>
                <span className={styles.dot} style={{ background: 'var(--success)' }} />
                <div>
                  <p className={styles.statLabel}>Income</p>
                  <p className={styles.statVal} style={{ color: 'var(--success)' }}>{fmt(income)}</p>
                </div>
              </div>
              <div className={styles.dividerV} />
              <div className={styles.balanceStat}>
                <span className={styles.dot} style={{ background: 'var(--danger)' }} />
                <div>
                  <p className={styles.statLabel}>Expenses</p>
                  <p className={styles.statVal} style={{ color: 'var(--danger)' }}>{fmt(expenses)}</p>
                </div>
              </div>
            </div>
          </div>

          {categoryStats.filter(s => s.budget).length > 0 && (
            <div>
              <p className="section-title">Budget overview</p>
              <div className={styles.budgetList}>
                {categoryStats.filter(s => s.budget).map(({ category, spent, budget }) => {
                  const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
                  const over = budget ? spent > budget : false;
                  return (
                    <div key={category.id} className="card" style={{ marginBottom: 8 }}>
                      <div className={styles.budgetRow}>
                        <div className={styles.catIcon} style={{ background: category.color + '22', color: category.color }}>
                          <ion-icon name={category.icon} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.budgetMeta}>
                            <span className={styles.catName}>{category.name}</span>
                            <span className={styles.budgetAmt} style={{ color: over ? 'var(--danger)' : 'var(--text-secondary)' }}>
                              {fmt(spent)} / {fmt(budget!)}
                            </span>
                          </div>
                          <div className="progress-bar" style={{ marginTop: 8 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : category.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="section-title">Recent transactions</p>
            {recentTx.length === 0 ? (
              <div className={styles.empty}>
                <p>No transactions yet</p>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Tap + to add your first</p>
              </div>
            ) : (
              <div>
                {recentTx.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <div key={tx.id} className={styles.txRow}>
                      <div className={styles.catIcon} style={{ background: (cat?.color || '#6b7280') + '22', color: cat?.color || '#6b7280' }}>
                        <ion-icon name={cat?.icon || 'ellipsis-horizontal'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className={styles.txNote}>{tx.note || cat?.name || 'Transaction'}</p>
                        <p className={styles.txDate}>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <span className={`amount ${styles.txAmt}`} style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: 'var(--tab-bar-height)' }}>
          <IonFabButton onClick={() => history.push('/add-transaction')} style={{ '--background': 'var(--accent)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
