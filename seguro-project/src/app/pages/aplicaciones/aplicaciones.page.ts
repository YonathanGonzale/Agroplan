import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { AplicacionesService } from '../../services/aplicaciones.service';
import { Aplicacion } from '../../interfaces/aplicacion.interface';

@Component({
  selector: 'app-aplicaciones',
  templateUrl: './aplicaciones.page.html',
  styleUrls: ['./aplicaciones.page.scss'],
})
export class AplicacionesPage implements OnInit {
  aplicaciones: Aplicacion[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  searchTerm = '';

  constructor(
    private aplicacionesService: AplicacionesService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.loadAplicaciones();
  }

  async loadAplicaciones(event?: any) {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    this.aplicacionesService.getAplicaciones(this.currentPage).subscribe(
      (response: any) => {
        const items = response.items || [];
        this.aplicaciones = items;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        loading.dismiss();
        if (event) event.target.complete();
      },
      (error) => {
        console.error('Error al cargar aplicaciones:', error);
        loading.dismiss();
        if (event) event.target.complete();
      }
    );
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.currentPage = 1;
    this.loadAplicaciones();
  }

  async onDeleteAplicacion(registro: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar esta aplicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteAplicacion(registro);
          }
        }
      ]
    });

    await alert.present();
  }

  private async deleteAplicacion(registro: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando...'
    });
    await loading.present();

    this.aplicacionesService.deleteAplicacion(registro).subscribe(
      () => {
        this.loadAplicaciones();
        loading.dismiss();
      },
      error => {
        console.error('Error al eliminar aplicación:', error);
        loading.dismiss();
      }
    );
  }



  loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.aplicacionesService.getAplicaciones(this.currentPage).subscribe(
        (response: any) => {
          const items = response.items || [];
          this.aplicaciones = [...this.aplicaciones, ...items];
          event.target.complete();
        },
        (error) => {
          console.error('Error al cargar más aplicaciones:', error);
          event.target.complete();
        }
      );
    } else {
      event.target.complete();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAplicaciones();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAplicaciones();
    }
  }



  async exportToExcel(registro?: number | undefined) {
    const loading = await this.loadingController.create({
      message: 'Generando Excel...'
    });
    await loading.present();

    this.aplicacionesService.exportToExcel(registro).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = registro ? `aplicacion-${registro}.xlsx` : 'registro-aplicaciones.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        loading.dismiss();
      },
      error => {
        console.error('Error al exportar a Excel:', error);
        loading.dismiss();
      }
    );
  }

  async exportarAplicacion(registro: number | undefined) {
    if (!registro) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo identificar la aplicación',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const alert = await this.alertController.create({
      header: 'Exportar Aplicación',
      message: '¿Desea exportar esta aplicación a Excel?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Exportar',
          handler: () => {
            this.exportToExcel(registro);
          }
        }
      ]
    });

    await alert.present();
  }
}
