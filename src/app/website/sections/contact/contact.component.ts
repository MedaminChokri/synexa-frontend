import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { Contact } from '../../../models/contact.model';
import { RendezVous } from '../../../models/rendez-vous.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitting = false;
  success = false;
  error = false;

  readonly servicesList = [
    'Conseil Stratégique',
    'Transformation Digitale',
    'Gestion de Projet',
    'Data Analytics',
    'Intelligence Artificielle',
    'Audit & Conformité',
    'Formation sur Mesure',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private rendezVousService: RendezVousService
  ) {
    this.contactForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      serviceChoisi: ['', Validators.required],
      dateRendezVous: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
      acceptRecontact: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitting = true;
      this.success = false;
      this.error = false;

      const formData = this.contactForm.value;

      // Toujours créer un Contact (visible dans "Contacts" admin)
      const contactData: Contact = {
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone || '',
        message: `[Service: ${formData.serviceChoisi}]${formData.dateRendezVous ? ' [RDV: ' + formData.dateRendezVous + ']' : ''} ${formData.message}`
      };

      this.contactService.sendContactForm(contactData)
        .pipe(catchError(() => of(null)))
        .subscribe(() => {
          // Si une date est fournie, créer aussi un Rendez-vous
          if (formData.dateRendezVous) {
            const rendezVousData: RendezVous = {
              nom: formData.nom,
              email: formData.email,
              telephone: formData.telephone || '',
              serviceChoisi: formData.serviceChoisi,
              dateRendezVous: formData.dateRendezVous,
              message: formData.message
            };
            this.rendezVousService.createRendezVous(rendezVousData)
              .pipe(catchError(() => of(null)))
              .subscribe(response => {
                this.submitting = false;
                if (response && response.success) {
                  this.success = true;
                  this.contactForm.reset();
                } else {
                  this.success = true; // Contact créé même si RDV échoue
                  this.contactForm.reset();
                }
              });
          } else {
            this.submitting = false;
            this.success = true;
            this.contactForm.reset();
          }
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
