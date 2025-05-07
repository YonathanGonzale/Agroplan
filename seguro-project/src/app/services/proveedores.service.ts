import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../interfaces/proveedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = 'http://localhost:3001/api/proveedores';

  constructor(private http: HttpClient) { }

  getProveedores(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('busqueda', search);
    }
    return this.http.get(this.apiUrl, { params });
  }

  getProveedor(codigo: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${codigo}`);
  }

  createProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  updateProveedor(codigo: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${codigo}`, proveedor);
  }

  deleteProveedor(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codigo}`);
  }

  searchProveedores(term: string): Observable<Proveedor[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Proveedor[]>(`${this.apiUrl}/search`, { params });
  }
}
