import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  topLevelMenuItems: computed('sessionUser.permissions.[]', function () {
    const items = [];

    if (this.clientInfo.moduleInvoices && this.abilities.can('view invoice')) {
      items.push({ path: 'invoices', label: 'Rechnungen !CHECK TRANSLATION!' });
      items.push({ path: 'payments', label: 'Zahlungen !CHECK TRANSLATION!' });
    }
    if (this.clientInfo.modulePatients && this.abilities.can('view patient')) {
      items.push({ path: 'patients', label: 'Patienten' });
    }
    if (this.clientInfo.moduleCalendar && this.abilities.can('view appointment')) {
      items.push({ path: 'appointments', label: 'Kalender !CHECK TRANSLATION!' });
    }
    if (this.clientInfo.moduleStats && this.abilities.can('view stats')) {
      items.push({ path: 'stats', label: 'Statistik' });
    }

    return items;
  }),
});
