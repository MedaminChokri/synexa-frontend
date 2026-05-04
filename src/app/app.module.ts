import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './website/home/home.component';
import { NavbarComponent } from './website/sections/navbar/navbar.component';
import { HeroComponent } from './website/sections/hero/hero.component';
import { ContactComponent } from './website/sections/contact/contact.component';
import { FooterComponent } from './website/sections/footer/footer.component';

// Client Auth Pages
import { SignupComponent } from './auth/signup/signup.component';
import { ClientLoginComponent } from './auth/login/client-login.component';

// Services
import { ApiService } from './core/services/api.service';
import { ContactService } from './core/services/contact.service';
import { InsightService } from './core/services/insight.service';
import { AdminService } from './core/services/admin.service';
import { RendezVousService } from './core/services/rendez-vous.service';
import { UtilisateurService } from './core/services/utilisateur.service';
import { ClientService } from './core/services/client.service';

// New sections
import { InsightsComponent } from './website/sections/insights/insights.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { ClientAuthGuard } from './core/guards/client-auth.guard';

// Widget Chatbot
import { ChatbotWidgetComponent } from './shared/components/chatbot/chatbot-widget.component';
import { ChatbotService } from './core/services/chatbot.service';

// Pages
import { AboutComponent } from './website/about/about.component';
import { InsightsPageComponent } from './website/insights/insights-page.component';
import { ContactPageComponent } from './website/contact/contact-page.component';
import { AgencePageComponent } from './website/agence/agence-page.component';

// Shared: Toast + BackToTop
import { ToastComponent } from './shared/components/toast/toast.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';

// Interceptors
import { CacheInterceptor } from './core/interceptors/cache.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    HeroComponent,
    ContactComponent,
    FooterComponent,
    // Auth & Client
    SignupComponent,
    // New sections
    InsightsComponent,
    // Widget Chatbot flottant
    ChatbotWidgetComponent,
    // Pages
    AboutComponent,
    InsightsPageComponent,
    ContactPageComponent,
    AgencePageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      },
      defaultLanguage: 'fr'
    }),
    // Standalone shared components
    ToastComponent,
    BackToTopComponent,
    ClientLoginComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    ...provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    ApiService,
    ContactService,
    AdminService,
    RendezVousService,
    UtilisateurService,
    ClientService,
    AuthGuard,
    ClientAuthGuard,
    InsightService,
    ChatbotService,
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
