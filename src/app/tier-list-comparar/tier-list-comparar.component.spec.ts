import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierListCompararComponent } from './tier-list-comparar.component';

describe('TierListCompararComponent', () => {
  let component: TierListCompararComponent;
  let fixture: ComponentFixture<TierListCompararComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierListCompararComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierListCompararComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
