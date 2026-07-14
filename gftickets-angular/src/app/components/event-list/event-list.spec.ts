import {
  provideHttpClient,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { EventListComponent } from './event-list';


describe('EventListComponent', () => {

  let fixture: ComponentFixture<EventListComponent>;
  let component: EventListComponent;
  let httpTesting: HttpTestingController;


  const apiUrl =
    'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';


  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports:[
        EventListComponent,
      ],

      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ],

    }).compileComponents();


    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;

    httpTesting =
      TestBed.inject(HttpTestingController);

  });



  afterEach(() => {
    httpTesting.verify();
  });



  it('should load events', () => {

    fixture.detectChanges();


    const request =
      httpTesting.expectOne(apiUrl);


    expect(request.request.method)
      .toBe('GET');


    request.flush([
      {
        id:1,
        nombre:'Concierto',
        descripcion:'Evento',
        fechaEvento:'2026-07-20',
        horaEvento:{
          hour:21,
          minute:30,
          second:0,
          nano:0,
        },
        precioMinimo:20,
        precioMaximo:40,
        localidad:'Barcelona',
        genero:'Música',
        nombreRecinto:'Palau',
        imagenUrl:'image.jpg',
      },
    ]);


    fixture.detectChanges();


    expect(
      fixture.nativeElement.textContent
    ).toContain('Concierto');

  });



  it('should show error when loading fails',()=>{

    fixture.detectChanges();


    const request =
      httpTesting.expectOne(apiUrl);


    request.flush(
      {},
      {
        status:500,
        statusText:'Server error',
      }
    );


    fixture.detectChanges();


    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Error al cargar eventos'
    );

  });

});