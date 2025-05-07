import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { ProductosService, Producto } from '../../../services/productos.service';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.page.html',
  styleUrls: ['./producto-form.page.scss'],
})
export class ProductoFormPage implements OnInit {
  productoForm: FormGroup;
  isEdit = false;
  registro: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private productosService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.productoForm = this.formBuilder.group({
      DESCRIPCION: ['', Validators.required],
      INGREDIENTE_ACTI: ['', Validators.required],
      PRODUCTO: ['', Validators.required]
    });
  }

  ngOnInit() {
    const registroParam = this.route.snapshot.paramMap.get('registro');
    this.registro = registroParam ? +registroParam : 0;
    this.isEdit = !!this.registro;

    if (this.isEdit) {
      this.loadProducto();
    }
  }

  async loadProducto() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();

    this.productosService.getProducto(this.registro).subscribe(
      (producto) => {
        this.productoForm.patchValue(producto);
        loading.dismiss();
      },
      error => {
        console.error('Error al cargar producto:', error);
        loading.dismiss();
        this.showToast('Error al cargar el producto', 'danger');
      }
    );
  }

  async onSubmit() {
    if (this.productoForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Guardando...'
      });
      await loading.present();

      const producto = this.productoForm.value;

      const request = this.isEdit
        ? this.productosService.updateProducto(this.registro, producto)
        : this.productosService.createProducto(producto);

      request.subscribe(
        () => {
          loading.dismiss();
          this.showToast(
            this.isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
            'success'
          );
          this.router.navigate(['/productos']);
        },
        error => {
          console.error('Error al guardar producto:', error);
          loading.dismiss();
          this.showToast('Error al guardar el producto', 'danger');
        }
      );
    } else {
      this.showToast('Por favor, complete todos los campos requeridos', 'warning');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
