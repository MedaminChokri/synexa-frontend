
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Contact } from '../../models/contact.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private apiService: ApiService) {}

  sendContactForm(contact: Contact): Observable<ApiResponse<Contact>> {
    return this.apiService.post<Contact>('contacts', contact);
  }

  getAll(): Observable<ApiResponse<Contact[]>> {
    return this.apiService.get<Contact[]>('contacts');
  }

  marquerLu(id: number): Observable<ApiResponse<Contact>> {
    return this.apiService.put<Contact>(`contacts/${id}/lu`, {});
  }
}
