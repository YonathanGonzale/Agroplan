import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { AplicacionDetalle } from '../interfaces/aplicacion-detalle';
import { Aplicacion } from '../interfaces/aplicacion.interface';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private apiUrl = `${environment.apiUrl}/aplicaciones`;

  constructor(private http: HttpClient) { }

  getAplicaciones(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('busqueda', search);
    }

    return this.http.get(this.apiUrl, { params });
  }

  getAplicacion(id: number | null): Observable<Aplicacion> {
    if (!id) throw new Error('ID is required');
    return this.http.get<Aplicacion>(`${this.apiUrl}/${id}`);
  }

  createAplicacion(aplicacion: Aplicacion): Observable<Aplicacion> {
    return this.http.post<Aplicacion>(this.apiUrl, aplicacion);
  }

  updateAplicacion(registro: number, aplicacion: Aplicacion): Observable<Aplicacion> {
    // Asegurarse de que los campos opcionales estén incluidos
    const aplicacionData = {
      ...aplicacion,
      receta_nro: aplicacion.receta_nro || '',
      fecha_exp: aplicacion.fecha_exp || '',
      reg_producto: aplicacion.reg_producto || '',
      entidad_comercializadora: aplicacion.entidad_comercializadora || ''
    };
    return this.http.put<Aplicacion>(`${this.apiUrl}/${registro}`, aplicacionData);
  }

  deleteAplicacion(registro: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${registro}`);
  }

  // Métodos para detalles de aplicación
  getDetallesAplicacion(aplicacionId: number): Observable<AplicacionDetalle[]> {
    return this.http.get<AplicacionDetalle[]>(`${this.apiUrl}/${aplicacionId}/detalles`);
  }

  addDetalleAplicacion(aplicacionId: number, detalle: AplicacionDetalle): Observable<AplicacionDetalle> {
    return this.http.post<AplicacionDetalle>(`${this.apiUrl}/${aplicacionId}/detalles`, detalle);
  }

  updateDetalleAplicacion(aplicacionId: number, detalleId: number, detalle: AplicacionDetalle): Observable<AplicacionDetalle> {
    return this.http.put<AplicacionDetalle>(`${this.apiUrl}/${aplicacionId}/detalles/${detalleId}`, detalle);
  }

  deleteDetalleAplicacion(aplicacionId: number, detalleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${aplicacionId}/detalles/${detalleId}`);
  }

  // Método para obtener una aplicación con sus detalles
  getAplicacionConDetalles(id: number): Observable<Aplicacion> {
    return forkJoin([
      this.getAplicacion(id),
      this.getDetallesAplicacion(id)
    ]).pipe(
      map(([aplicacion, detalles]) => ({
        ...aplicacion,
        detalles
      }))
    );
  }



  getAplicacionForPdf(registro: number): Observable<any> {
    return forkJoin([
      this.getAplicacion(registro),
      this.getDetallesAplicacion(registro)
    ]).pipe(
      map(([aplicacion, detalles]) => ({
        aplicacion,
        detalles: detalles.map(detalle => ({
          ...detalle,
          fecha: detalle.fecha ? new Date(detalle.fecha).toLocaleDateString() : '-',
          epi: detalle.epi_usado ? 'Sí' : 'No'
        }))
      }))
    );
  }

  exportToExcel(registro?: number): Observable<Blob> {
    const url = registro ? `${this.apiUrl}/${registro}/export/excel` : `${this.apiUrl}/export/excel`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }
}
