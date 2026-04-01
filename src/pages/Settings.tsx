import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonToast
} from '@ionic/react';
import { useState } from 'react';
import { useSettings } from '../hooks/useStorage';
import { saveSettings } from '../store/storage';
import { AppSettings } from '../types';
import styles from './Settings.module.css';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'NPR', symbol: '₨', label: 'Nepali Rupee' },
];

const Settings: React.FC = () => {
  const { settings, refresh } = useSettings();
  const [showToast, setShowToast] = useState(false);

  const handleCurrencyChange = (code: string) => {
    const cur = CURRENCIES.find(c => c.code === code);
    if (!cur) return;
    const updated: AppSettings = { ...settings, currency: cur.code, currencySymbol: cur.symbol };
    saveSettings(updated);
    refresh();
    setShowToast(true);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete ALL transactions and budgets.')) {
      localStorage.removeItem('spendly_transactions');
      localStorage.removeItem('spendly_budgets');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'var(--font)', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Settings
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={styles.wrap}>

          {/* App info */}
          <div className={styles.appCard}>
            <div className={styles.appIcon}>S</div>
            <p className={styles.appName}>Spendly</p>
            <p className={styles.appVersion}>MVP v0.1.0</p>
          </div>

          {/* Currency */}
          <div>
            <p className="section-title">Currency</p>
            <div className={styles.currencyGrid}>
              {CURRENCIES.map(cur => (
                <button
                  key={cur.code}
                  className={`${styles.curBtn} ${settings.currency === cur.code ? styles.curBtnActive : ''}`}
                  onClick={() => handleCurrencyChange(cur.code)}
                >
                  <span className={styles.curSymbol}>{cur.symbol}</span>
                  <span className={styles.curCode}>{cur.code}</span>
                  <span className={styles.curLabel}>{cur.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div>
            <p className="section-title">Data</p>
            <div className="card">
              <button className={styles.dangerRow} onClick={handleClearData}>
                <span>Clear all data</span>
                <span className={styles.dangerBadge}>Destructive</span>
              </button>
            </div>
          </div>

          {/* About */}
          <div>
            <p className="section-title">About</p>
            <div className="card">
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Version</span>
                <span className={styles.aboutVal}>0.1.0</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Storage</span>
                <span className={styles.aboutVal}>localStorage (offline)</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Framework</span>
                <span className={styles.aboutVal}>React + Ionic + Capacitor</span>
              </div>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          message="Settings saved"
          duration={1500}
          onDidDismiss={() => setShowToast(false)}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
