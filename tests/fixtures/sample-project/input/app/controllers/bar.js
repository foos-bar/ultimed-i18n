import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import window from 'ember-window-mock';
import Controller from '@ember/controller';
import formatDate from 'ultimed/utils/format-date';
import changeSort from 'ultimed/utils/change-sort';
import { tracked } from '@glimmer/tracking';

@classic
export default class FilesController extends Controller {
  @service api;
  @service('file-gallery') gallery;
  @service navbar;
  @service notify;
  @service sessionUser;

  queryParams = ['from', 'to', 'noPatient', 'onlyNew', 'page', 'size', 'sort'];
  @tracked sort = '-date';
  noPatient = false;
  onlyNew = false;
  page = 1;
  size = 10;

  // set in the route, in Ember 4.0 we should able able to call `routerService.refresh()` instead
  refreshModel() { }

  @action
  onSortChange(property) {
    this.sort = changeSort(property, this.sort);
  }

  @action
  dateChanged(property, date) {
    this.set(property, formatDate(date));
  }

  @action
  showGallery(file) {
    if (!file.isImage && !file.isPdf) {
      return;
    }
    this.set('gallery.files', [file]), this.set('gallery.patient', undefined);
    this.set('gallery.currentFile', file);
    this.set('gallery.pinnedFile', undefined);
    this.set('gallery.showModal', true);
  }

  @action
  assignPatient(file, patient) {
    file.set('patient', patient);
    file
      .save()
      .then(() => {
        this.notify.success('Zuordnung erfolgreich geändert.');
      })
      .catch(() => {
        this.notify.warning('Patient konnte nicht zugewiesen werden.');
      });
  }

  @action
  markAllAsViewed() {
    if (!window.confirm('Sollen wirklich alle Dateien als gelesen markiert werden?')) {
      return;
    }
    this.api
      .post('/files/markAsViewed')
      .then(() => {
        this.refreshModel();
        this.navbar.refresh();
      })
      .catch(() => {
        this.notify.warning('Die Dateien konnten nicht als gelesen markiert werden.');
      });
  }
}
