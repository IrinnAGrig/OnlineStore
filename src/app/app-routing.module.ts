import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [{ path: '', redirectTo: 'home', pathMatch: 'full' },
{
  path: '',
  canActivateChild: [AuthGuard],
  component: LayoutComponent,
  children: [
    {
      path: 'home',
      data: {
        role: ['Any'],
      },
      loadChildren: () =>
        import('./home/home.module').then(m => m.HomeModule),
    },
    {
      path: 'auth',
      data: {
        role: ['Any'],
      },
      loadChildren: () =>
        import('./auth/auth.module').then(m => m.AuthModule),
    },
    {
      path: 'product',
      data: {
        role: ['Any'],
      },
      children: [
        {
          path: 'add-new-product',
          loadChildren: () =>
            import('./product/product.module').then(m => m.ProductModule),
        },
        {
          path: ':idProd',
          loadChildren: () =>
            import('./product/product.module').then(m => m.ProductModule),
        }
      ]
    },
    {
      path: 'store',
      data: {
        role: ['Any'],
      },
      children: [
        {
          path: ':category/:subcategory',
          loadChildren: () =>
            import('./store/store.module').then(
              m => m.StoreModule
            ),
        },
        {
          path: ':category',
          loadChildren: () =>
            import('./store/store.module').then(
              m => m.StoreModule
            ),
        }
      ]
    },
    {
      path: 'profile',
      data: {
        role: ['user', 'admin'],
      },
      loadChildren: () =>
        import('./profile/profile.module').then(
          m => m.ProfileModule
        ),
    },
    {
      path: 'cart',
      data: {
        role: ['user'],
      },
      loadChildren: () =>
        import('./cart/cart.module').then(
          m => m.CartModule
        ),
    }
  ],
},
{
  path: '**',
  redirectTo: 'login',
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
