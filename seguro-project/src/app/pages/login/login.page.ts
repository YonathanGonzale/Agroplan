import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...'
      });
      await loading.present();

      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe(
        async () => {
          await loading.dismiss();
          await this.router.navigate(['/home']);
        },
        async (error) => {
          console.error('Error de inicio de sesión:', error);
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Error al iniciar sesión. Por favor, verifique sus credenciales.',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
      );
    }
  }
}
