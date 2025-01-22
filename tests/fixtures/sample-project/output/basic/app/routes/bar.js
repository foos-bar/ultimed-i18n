import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { getInterval } from 'ultimed/utils/calendar';
import { storageFor } from 'ember-local-storage';

@classic
export default class CalendarRoute extends Route {
  @service layout;
  @service notify;
  @service router;
  @service session;
  @service calendarPopover;
  @service calendarColumns;
  @service clientInfo;
  @service settingValueRepository;
  @service userRepository;
  @service resourceRepository;
  @service locationRepository;
  @service appointmentCategoryRepository;
  @service serviceRepository;
  @service store;
  @service('calendar-repository') repository;
  @storageFor('calendarColumns') calendarColumnLocalStorage;
  @storageFor('calendarSettings') settings;

  queryParams = {
    date: { refreshModel: true },
    people: { refreshModel: true },
    locations: { refreshModel: true },
    viewType: { refreshModel: true },
    resources: { refreshModel: true },
    categories: { refreshModel: true },
    services: { refreshModel: true },
    slots: { refreshModel: true },
    categoryColumns: { refreshModel: true },
    userColumns: { refreshModel: true },
    locationColumns: { refreshModel: true },
    resourceColumns: { refreshModel: true },
    showOtherColumn: { refreshModel: true },
    hideColumnsWithoutAppointment: { refreshModel: true },
    appointmentId: { refreshModel: false },
    mode: { refreshModel: false },
  };

  model(params) {
    if (
      this.clientInfo.disableWeekViewWithoutFilters &&
      params.viewType.indexOf('Day') === -1 &&
      params.people.length === 0 &&
      params.locations.length === 0 &&
      params.resources.length === 0 &&
      params.categories.length === 0 &&
      params.services.length === 0
    ) {
      if (!this.notification?.visible) {
        this.set(
          'notification',
          this.notify.warning('Das Laden der Wochenübersicht ohne Filter ist deaktiviert. !CHECK TRANSLATION!')
        );
      }
      return [];
    }

    if (params.people.length === 0) {
      delete params.people;
    }
    if (params.locations.length === 0) {
      delete params.locations;
    }
    if (params.resources.length === 0) {
      delete params.resources;
    }
    if (params.categories.length === 0) {
      delete params.categories;
    }
    if (params.services.length === 0) {
      delete params.services;
    }
    const interval = getInterval(params.date, params.viewType);
    this.repository.setupDateRange(interval.unit, interval.start, interval.end);
    return this.repository.findInCurrentDateRange.perform(params);
  }

  afterModel() {
    super.afterModel(...arguments);
    const presetsSettingValue =
      this.settingValueRepository.getValue('calendar-presets', undefined) ||
      this.store.createRecord('setting-value', {
        key: 'calendar-presets',
        value: '[]',
      });
    let presets = JSON.parse(presetsSettingValue.value);
    if (!this.calendarColumnLocalStorage?.length) {
      return;
    }
    presets = presets.concat(
      this.calendarColumnLocalStorage
        .map((preset) => {
          return {
            name: preset.name,
            userColumns: preset.people,
            locationColumns: preset.locations,
            resourceColumns: preset.resources,
            categoryColumns: preset.categories,
          };
        })
        .filter(
          (preset1) =>
            !presets.any((preset2) => this.calendarColumns.isPresetEqual(preset1, preset2))
        )
    );
    presetsSettingValue.set('value', JSON.stringify(presets));
    presetsSettingValue
      .save()
      .catch(() => { })
      .finally(() => {
        this.calendarColumnLocalStorage.clear();
      });
  }
}
