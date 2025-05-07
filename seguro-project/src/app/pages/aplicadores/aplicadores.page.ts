import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AplicadoresService } from '../../services/aplicadores.service';
import { Aplicador } from '../../interfaces/aplicador.interface';

@Component({
  selector: 'app-aplicadores',
  templateUrl: './aplicadores.page.html',
  styleUrls: ['./aplicadores.page.scss'],
})
export class AplicadoresPage implements OnInit {
  aplicadores: Aplicador[] = [];
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';
  itemsPerPage = 10;

  constructor(
    private aplicadoresService: AplicadoresService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadAplicadores();
  }

  loadAplicadores(event?: any) {
    this.aplicadoresService.getAplicadores(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe(
        (response: any) => {
          if (this.currentPage === 1) {
            this.aplicadores = response.data;
          } else {
            this.aplicadores = [...this.aplicadores, ...response.data];
          }
          this.totalPages = response.pagination.totalPages;
          if (event) {
            event.target.complete();
          }
        },
        async (error) => {
          console.error('Error loading aplicadores:', error);
          const toast = await this.toastController.create({
            message: 'Error al cargar los aplicadores',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
          if (event) {
            event.target.complete();
          }
        }
      );
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.currentPage = 1;
    this.loadAplicadores();
  }

  loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAplicadores(event);
    } else {
      event.target.complete();
    }
  }

  async confirmDelete(aplicador: Aplicador) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar el aplicador ${aplicador.productor}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteAplicador(aplicador.codigo!);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAplicador(codigo: number) {
    this.aplicadoresService.deleteAplicador(codigo).subscribe(
      async () => {
        const toast = await this.toastController.create({
          message: 'Aplicador eliminado correctamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.currentPage = 1;
        this.loadAplicadores();
      },
      async (error) => {
        console.error('Error deleting aplicador:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el aplicador',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
  }

  async doRefresh(event: any) {
    this.currentPage = 1;
    this.searchTerm = '';
    await this.loadAplicadores();
    event.target.complete();
  }
}
