import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Aplicacion } from '../../../interfaces/aplicacion.interface';
import { AplicacionDetalle } from '../../../interfaces/aplicacion-detalle';
import { DetalleFormComponent } from '../detalle-form/detalle-form.component';

@Component({
  selector: 'app-aplicacion-form',
  templateUrl: './aplicacion-form.page.html',
  styleUrls: ['./aplicacion-form.page.scss'],
})
export class AplicacionFormPage implements OnInit {
  aplicacionForm: FormGroup;
  isEdit = false;
  aplicacionId?: number;

  get detallesFormArray() {
    return this.aplicacionForm.get('detalles') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.aplicacionForm = this.fb.group({
      fecha: ['', Validators.required],
      parcela_id: ['', Validators.required],
      observaciones: [''],
      detalles: this.fb.array([])
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.aplicacionId = +params['id'];
        this.cargarAplicacion();
      }
    });
  }

  async cargarAplicacion() {
    const loading = await this.loadingController.create({
      message: 'Cargando aplicación...'
    });
    await loading.present();

    try {
      // TODO: Implementar servicio para cargar aplicación
      const aplicacion: Aplicacion = {
        fecha: new Date(),
        parcela_id: 1,
        observaciones: '',
        detalles: []
      };

      // Actualizar campos básicos
      this.aplicacionForm.patchValue({
        fecha: aplicacion.fecha,
        parcela_id: aplicacion.parcela_id,
        observaciones: aplicacion.observaciones
      });

      // Limpiar detalles existentes
      while (this.detallesFormArray.length !== 0) {
        this.detallesFormArray.removeAt(0);
      }

      // Agregar nuevos detalles
      aplicacion.detalles?.forEach(detalle => {
        const detalleForm = this.fb.group({
          cultivo: [detalle.cultivo || '', Validators.required],
          nombre_comercial: [detalle.nombre_comercial || '', Validators.required],
          area: [detalle.area || 0, [Validators.required, Validators.min(0)]]
        });
        this.detallesFormArray.push(detalleForm);
      });

    } catch (error) {
      console.error('Error al cargar la aplicación:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar la aplicación',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async guardarAplicacion() {
    if (this.aplicacionForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Guardando aplicación...'
      });
      await loading.present();

      try {
        const aplicacionData = this.aplicacionForm.value;
        // TODO: Implementar servicio para guardar aplicación
        console.log('Datos a guardar:', aplicacionData);

        await loading.dismiss();
        await this.router.navigate(['/aplicaciones']);

      } catch (error) {
        console.error('Error al guardar la aplicación:', error);
        const toast = await this.toastController.create({
          message: 'Error al guardar la aplicación',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } else {
      const toast = await this.toastController.create({
        message: 'Por favor, complete todos los campos requeridos',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    }
  }

  async agregarDetalle() {
    const modal = await this.modalController.create({
      component: DetalleFormComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      const detalleForm = this.fb.group({
        cultivo: [data.cultivo || '', Validators.required],
        nombre_comercial: [data.nombre_comercial || '', Validators.required],
        area: [data.area || 0, [Validators.required, Validators.min(0)]]
      });
      this.detallesFormArray.push(detalleForm);
    }
  }

  async editarDetalle(index: number) {
    const detalleActual = this.detallesFormArray.at(index).value;
    const modal = await this.modalController.create({
      component: DetalleFormComponent,
      componentProps: {
        detalle: { ...detalleActual }
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.detallesFormArray.at(index).patchValue({
        cultivo: data.cultivo,
        nombre_comercial: data.nombre_comercial,
        area: data.area
      });
    }
  }

  eliminarDetalle(index: number) {
    this.detallesFormArray.removeAt(index);
  }
}
