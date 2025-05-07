import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AplicadoresService } from '../../../services/aplicadores.service';
import { Aplicador } from '../../../interfaces/aplicador.interface';

@Component({
  selector: 'app-aplicador-form',
  templateUrl: './aplicador-form.page.html',
  styleUrls: ['./aplicador-form.page.scss'],
})
export class AplicadorFormPage implements OnInit {
  aplicadorForm: FormGroup;
  isEdit = false;
  aplicadorId?: number;

  constructor(
    private fb: FormBuilder,
    private aplicadoresService: AplicadoresService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.aplicadorForm = this.fb.group({
      productor: ['', Validators.required],
      correo: [''],
      telefono: [''],
      direccion: [''],
      aplicadores: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.aplicadorId = +id;
      this.loadAplicador(this.aplicadorId);
    }
  }

  async loadAplicador(id: number) {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    this.aplicadoresService.getAplicador(id).subscribe(
      (aplicador) => {
        this.aplicadorForm.patchValue(aplicador);
        loading.dismiss();
      },
      async (error) => {
        console.error('Error loading aplicador:', error);
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Error al cargar el aplicador',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
  }

  async onSubmit() {
    if (this.aplicadorForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Guardando...',
      });
      await loading.present();

      const aplicador: Aplicador = this.aplicadorForm.value;

      const action = this.isEdit
        ? this.aplicadoresService.updateAplicador(this.aplicadorId!, aplicador)
        : this.aplicadoresService.createAplicador(aplicador);

      action.subscribe(
        async () => {
          loading.dismiss();
          const toast = await this.toastController.create({
            message: `Aplicador ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`,
            duration: 2000,
            color: 'success'
          });
          toast.present();
          this.router.navigate(['/aplicadores']);
        },
        async (error) => {
          console.error('Error saving aplicador:', error);
          loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Error al guardar el aplicador',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      );
    }
  }
}
