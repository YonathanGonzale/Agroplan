import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AplicacionesService } from '../../../services/aplicaciones.service';
import { AplicacionDetalle } from '../../../interfaces/aplicacion-detalle';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-aplicacion-detalles',
  templateUrl: './aplicacion-detalles.component.html',
  styleUrls: ['./aplicacion-detalles.component.scss']
})
export class AplicacionDetallesComponent implements OnInit {
  @Input() aplicacionId!: number;
  detalles: AplicacionDetalle[] = [];
  detalleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private aplicacionesService: AplicacionesService,
    private alertController: AlertController
  ) {
    this.detalleForm = this.createForm();
  }

  ngOnInit() {
    this.loadDetalles();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      cultivo: ['', Validators.required],
      area: ['', [Validators.required, Validators.min(0)]],
      producto: [''],
      descripcion: ['', Validators.required],
      ingrediente_activo: ['', Validators.required],
      dosis: ['', [Validators.required, Validators.min(0)]],
      objetivo: ['', Validators.required],
      aplicador: ['', Validators.required],
      epi_usado: [true],
      tipo_pico: ['Conico', Validators.required],
      vol_agua: ['', [Validators.required, Validators.min(0)]],
      temperatura: ['', [Validators.required, Validators.min(-50), Validators.max(60)]],
      humedad: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      velocidad_viento: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadDetalles() {
    this.aplicacionesService.getDetallesAplicacion(this.aplicacionId)
      .subscribe(
        (detalles) => {
          this.detalles = detalles;
        },
        (error) => {
          console.error('Error al cargar detalles:', error);
        }
      );
  }

  async onSubmit() {
    if (this.detalleForm.valid) {
      const detalle: AplicacionDetalle = this.detalleForm.value;
      this.aplicacionesService.addDetalleAplicacion(this.aplicacionId, detalle)
        .subscribe(
          (newDetalle) => {
            this.detalles.push(newDetalle);
            this.detalleForm.reset();
            this.showAlert('Éxito', 'Detalle agregado correctamente');
          },
          (error) => {
            console.error('Error al agregar detalle:', error);
            this.showAlert('Error', 'No se pudo agregar el detalle');
          }
        );
    }
  }

  async onDeleteDetalle(detalleId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar este detalle?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.aplicacionesService.deleteDetalleAplicacion(this.aplicacionId, detalleId)
              .subscribe(
                () => {
                  this.detalles = this.detalles.filter(d => d.registro !== detalleId);
                  this.showAlert('Éxito', 'Detalle eliminado correctamente');
                },
                (error) => {
                  console.error('Error al eliminar detalle:', error);
                  this.showAlert('Error', 'No se pudo eliminar el detalle');
                }
              );
          }
        }
      ]
    });
    await alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
