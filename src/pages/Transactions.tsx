import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonFab, IonFabButton, IonIcon, IonAlert, IonSearchbar
} from '@ionic/react';
import { add, trashOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTransactions, useCategories, useSettings } from '../hooks/useStorage';
import { deleteTransaction } from '../store/storage';
import { Transaction } from '../types';
import styles from './Transactions.module.css';

const Transactions: React.FC = () => {
  const history = useHistory();
  const { transactions, refresh } = useTransactions();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sym = settings.currencySymbol;

  const filtered = transactions.filter(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    const text = `${tx.note} ${cat?.name}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const grouped = filtered.reduce((acc: Record<string, Transaction[]>, tx) => {
    const date = tx.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      refresh();
      setDeletingId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Transactions
          </IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(e.detail.value || '')}
            placeholder="Search transactions..."
            style={{ '--background': 'var(--bg-secondary)', '--color': 'var(--text-primary)', '--placeholder-color': 'var(--text-tertiary)' }}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={styles.wrap}>
          {sortedDates.length === 0 && (
            <div className={styles.empty}>
              <p>No transactions found</p>
            </div>
          )}
          {sortedDates.map(date => (
            <div key={date} className={styles.group}>
              <p className={styles.dateHeader}>
                {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {grouped[date].map((tx, i) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      className={styles.txRow}
                      style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                    >
                      <div className={styles.catIcon} style={{ background: (cat?.color || '#6b7280') + '22', color: cat?.color || '#6b7280' }}>
                        <ion-icon name={cat?.icon || 'ellipsis-horizontal'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className={styles.txNote}>{tx.note || cat?.name || 'Transaction'}</p>
                        <p className={styles.txCat}>{cat?.name}</p>
                      </div>
                      <div className={styles.txRight}>
                        <span
                          className={`amount ${styles.txAmt}`}
                          style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)' }}
                        >
                          {tx.type === 'income' ? '+' : '-'}{sym}{tx.amount.toFixed(2)}
                        </span>
                        <button className={styles.deleteBtn} onClick={() => setDeletingId(tx.id)}>
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <IonAlert
          isOpen={!!deletingId}
          header="Delete transaction?"
          message="This cannot be undone."
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setDeletingId(null) },
            { text: 'Delete', role: 'destructive', handler: handleDelete }
          ]}
          onDidDismiss={() => setDeletingId(null)}
        />

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: 'var(--tab-bar-height)' }}>
          <IonFabButton onClick={() => history.push('/add-transaction')} style={{ '--background': 'var(--accent)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Transactions;
