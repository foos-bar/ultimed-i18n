import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class NestedBarBaz extends Component {

  get topLevelMenuItems() {
    const items = [];

    if (this.clientInfo.moduleInvoices && this.abilities.can('view invoice')) {
      items.push({ path: 'invoices !CHECK TRANSLATION!', label: 'Rechnungen !CHECK TRANSLATION!' });
      items.push({ path: 'payments', label: 'Zahlungen !CHECK TRANSLATION!' });
    }
    if (this.clientInfo.modulePatients && this.abilities.can('view patient')) {
      items.push({ path: 'patients', label: 'Patienten !CHECK TRANSLATION!' });
    }
    if (this.clientInfo.moduleCalendar && this.abilities.can('view appointment')) {
      items.push({ path: 'appointments !CHECK TRANSLATION!', label: 'Kalender !CHECK TRANSLATION!' });
    }
    if (this.clientInfo.moduleStats && this.abilities.can('view stats !CHECK TRANSLATION!')) {
      items.push({ path: 'stats !CHECK TRANSLATION!', label: 'Statistik !CHECK TRANSLATION!' });
    }

    return items;
  }
};