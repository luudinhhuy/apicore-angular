import { Routes, RouterModule } from '@angular/router';
import { AccountReceivablePayableComponent } from './account-receivable-payable/account-receivable-payable.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';

const routes: Routes = [
  {
    path: '', redirectTo: 'statement-of-account'
  },
  {
    path: 'statement-of-account', loadChildren: () => import('./statement-of-account/statement-of-account.module').then(m => m.StatementOfAccountModule),
    data: {
      name: 'Statement Of Account'
    }
  },
  {
    path: 'advance-payment', loadChildren: () => import('./advance-payment/advance-payment.module').then(m => m.AdvancePaymentModule),
    data: {
      name: 'Advance Payment'
    }
  },
  {
    path: 'settlement-payment', loadChildren: () => import('./settlement-payment/settlement-payment.module').then(m => m.SettlementPaymentModule),
    data: {
      name: 'Settlement Payment'
    }
  },
  {
    path: 'account-receivable-payable', component: AccountReceivablePayableComponent, data: {
      name: "Account Receivable Payable",
    }
  },
  // TODO another MODULE...
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
