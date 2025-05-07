import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AplicacionDetalle } from '../../../interfaces/aplicacion-detalle';

@Component({
  selector: 'app-detalle-form',
  templateUrl: './detalle-form.component.html',
  styleUrls: ['./detalle-form.component.scss']
})
export class DetalleFormComponent implements OnInit {
  @Input() detalle?: AplicacionDetalle;
  detalleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) {
    this.detalleForm = this.fb.group({
      cultivo: ['', Validators.required],
      area: ['', [Validators.required, Validators.min(0)]],
      nombre_comercial: ['', Validators.required],
      ingrediente_activo: ['', Validators.required],
      dosis: ['', [Validators.required, Validators.min(0)]],
      objetivo_aplicacion: ['', Validators.required],
      nombre_aplicador: ['', Validators.required],
      epi_usado: [false],
      tipo_pico: ['', Validators.required],
      vol_agua: ['', [Validators.required, Validators.min(0)]],
      temperatura: ['', [Validators.required, Validators.min(-50), Validators.max(60)]],
      humedad: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      velocidad_viento: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.detalle) {
      this.detalleForm.patchValue(this.detalle);
    }
  }

  async guardar(): Promise<void> {
    if (this.detalleForm.valid) {
      await this.modalController.dismiss(this.detalleForm.value);
    }
  }

  async cancelar(): Promise<void> {
    await this.modalController.dismiss();
  }
}
