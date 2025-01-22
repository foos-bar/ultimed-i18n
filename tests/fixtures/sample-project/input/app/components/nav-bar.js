/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-classic-components, ember/require-computed-property-dependencies, ember/require-tagless-components, ember/use-brace-expansion */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  abilities: service(),
  clientInfo: service(),
  session: service(),
  store: service(),
  calendarPopover: service(),
  navbar: service(),
  sessionUser: service('session-user'),

  classNames: ['navbar', 'navbar-default'],

  patientSelected() { },

  init() {
    this._super(...arguments);
    this.set('ecardDialogs', this.store.peekAll('ecard-dialog'));
    this.set('ecardServiceEndpoints', this.store.peekAll('ecard-service-endpoint'));
  },

  topLevelMenuItems: computed('sessionUser.permissions.[]', function () {
    const items = [];

    if (this.clientInfo.moduleInvoices && this.abilities.can('view invoice')) {
      items.push({ path: 'invoices', label: 'Rechnungen' });
      items.push({ path: 'payments', label: 'Zahlungen' });
    }
    if (this.clientInfo.modulePatients && this.abilities.can('view patient')) {
      items.push({ path: 'patients', label: 'Patienten' });
    }
    if (this.clientInfo.moduleCalendar && this.abilities.can('view appointment')) {
      items.push({ path: 'appointments', label: 'Kalender' });
    }
    if (this.clientInfo.moduleStats && this.abilities.can('view stats')) {
      items.push({ path: 'stats', label: 'Statistik' });
    }

    return items;
  }),

  adminMenuItems: computed('sessionUser.permissions.[]', 'sessionUser.roles.[]', function () {
    const items = [];

    items.push({ path: 'contacts', label: 'Kontakte' });
    items.push({ path: 'services', label: 'Leistungen' });
    if (this.clientInfo.enableGoae) {
      items.push({ path: 'goaeServices', label: 'GOÄ Leistungen' });
    }

    if (this.clientInfo.moduleInvoices) {
      items.push({ path: 'products', label: 'Produktlager' });
    }

    items.push({ path: 'messageTemplates', label: 'Nachrichtenvorlagen' });

    if (this.clientInfo.modulePatients && this.abilities.can('edit patient')) {
      items.push({ path: 'forms', label: 'PDF Formulare' });
    }

    if (!this.abilities.can('edit administration')) {
      return items;
    }

    items.push({ path: 'wahonline', label: 'WAHonline' });

    items.push({ path: 'webForms', label: 'Web Formulare' });
    items.push({ path: 'automations', label: 'Automationen' });
    items.push({ path: 'settings', label: 'Praxiseinstellungen' });

    if (this.clientInfo.moduleTcm) {
      items.push({ __isDivider: true });
      items.push({ path: 'tcmIngredients', label: 'TCM Kräuter' });
      items.push({ path: 'tcmMixtures', label: 'TCM Rezepturen' });
    }
    if (this.clientInfo.moduleInvoices) {
      items.push({ __isDivider: true });
      items.push({ path: 'costCenters', label: 'Kostenstellen' });
      items.push({ path: 'packages', label: 'Pakete' });
      items.push({ path: 'productGroups', label: 'Produktgruppen' });
      items.push({ path: 'discounts', label: 'Rabatte' });
      if (this.clientInfo.enableRevenueShare) {
        items.push({ path: 'revenueShare', label: 'Prozentanteile' });
      }
      if (
        this.clientInfo.enablePaymentConfigurations &&
        this.abilities.can('manageRegisters invoice')
      ) {
        items.push({
          path: 'paymentConfigurations',
          label: 'Zahlungsmethoden',
        });
      }
    }
    if (this.clientInfo.modulePatients) {
      items.push({ __isDivider: true });
      items.push({ path: 'fileTags', label: 'Datei-Tags' });
      items.push({ path: 'contactTags', label: 'Kontakt-Tags' });
      items.push({ path: 'vaccines', label: 'Impfungen' });
      items.push({ path: 'categories', label: 'Patientenkategorien' });
      items.push({ path: 'customFields', label: 'Patientenstammdaten' });
    }
    if (this.clientInfo.moduleCalendar) {
      items.push({ __isDivider: true });
      items.push({ path: 'locations', label: 'Orte' });
      items.push({ path: 'resources', label: 'Ressourcen' });
      items.push({
        path: 'appointmentCategories',
        label: 'Terminkategorien',
      });
    }
    if (this.abilities.can('user administration')) {
      items.push({ __isDivider: true });
      items.push({ path: 'users', label: 'Benutzer' });
      items.push({ path: 'roles', label: 'Rollen' });
    }
    if (this.abilities.can('super administration')) {
      items.push({ __isDivider: true });
      if (this.clientInfo.moduleInvoices) {
        items.push({
          path: 'invoiceNumberSequences',
          label: 'Rechnungskreise',
        });
        items.push({ path: 'registers', label: 'Kassen' });
        items.push({ __isDivider: true });
        items.push({ path: 'tssUnits', label: 'Technische Sicherheitseinrichtung' });
        items.push({ path: 'cashPointClosings', label: 'Cash Point Closings' });
        items.push({ path: 'dsfinvkExports', label: 'DSFinV-K Exports' });
      }
    }
    items.push({ __isDivider: true });
    items.push({
      externalLink:
        'https://mobimed.notion.site/Willkommen-im-Helpcenter-274516cfa50b4ac6a684c85453415285',
      label: 'HelpCenter',
    });

    return items;
  }),

  actions: {
    patientSelectedFromNavbar(patient) {
      this.patientSelected(patient);
    },
    logout() {
      this.session.invalidate();
    },
    createAppointment() {
      const appointment = this.store.createRecord('appointment');
      this.calendarPopover.showAppointment(appointment);
    },
  },
});
