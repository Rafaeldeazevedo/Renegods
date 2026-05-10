import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierListDetalheComponent } from './tier-list-detalhe.component';

describe('TierListDetalheComponent', () => {
  let component: TierListDetalheComponent;
  let fixture: ComponentFixture<TierListDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierListDetalheComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierListDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
