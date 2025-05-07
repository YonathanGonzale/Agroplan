import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private toastController: ToastController) {}

  async handleError(error: any) {
    console.error('Error:', error);

    let message = 'Ha ocurrido un error';

    if (error.error?.message) {
      message = error.error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();
  }

  async showWarning(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'warning'
    });

    await toast.present();
  }
}
