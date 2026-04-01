import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { homeOutline, listOutline, walletOutline, settingsOutline, settingsSharp } from 'ionicons/icons';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import AddTransaction from './pages/AddTransaction';

setupIonicReact({ mode: 'ios' });

const Tabs: React.FC = () => {
  const location = useLocation(); // ✅ now it's inside router
  const current = location.pathname;

  const tabs = [
    { path: '/dashboard', label: 'Home', outline: homeOutline, filled: homeOutline },
    { path: '/transactions', label: 'Transactions', outline: listOutline, filled: listOutline },
    { path: '/budgets', label: 'Budgets', outline: walletOutline, filled: walletOutline },
    { path: '/settings', label: 'Settings', outline: settingsOutline, filled: settingsSharp },
  ];

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/transactions" component={Transactions} />
        <Route exact path="/budgets" component={Budgets} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/add-transaction" component={AddTransaction} />
        <Route exact path="/">
          <Redirect to="/dashboard" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        {tabs.map(tab => {
          const isActive = current.startsWith(tab.path);

          return (
            <IonTabButton
              key={tab.path}
              tab={tab.path.replace('/', '')}
              href={tab.path}
            >
              <IonIcon
                icon={isActive ? tab.filled : tab.outline}
                style={{
                  color: isActive
                    ? 'var(--accent-light)'
                    : 'var(--text-tertiary)'
                }}
              />
              <IonLabel
                style={{
                  color: isActive
                    ? 'var(--accent-light)'
                    : 'var(--text-tertiary)'
                }}
              >
                {tab.label}
              </IonLabel>
            </IonTabButton>
          );
        })}
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactHashRouter>
        <Tabs /> {/* ✅ now inside router */}
      </IonReactHashRouter>
    </IonApp>
  );
};

export default App;
