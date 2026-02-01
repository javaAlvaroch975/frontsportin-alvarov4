import { Routes } from '@angular/router';
import { Home } from './component/shared/home/home';
import { ArticuloPlistAdminRouted } from './component/articulo/plist-admin-routed/articulo-plist';
import { NoticiaPlistAdminRouted } from './component/noticia/plist-admin-routed/noticia-plist';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'articulo', component: ArticuloPlistAdminRouted},
    { path: 'articulo/:tipoarticulo', component: ArticuloPlistAdminRouted},
    { path: 'noticia', component: NoticiaPlistAdminRouted},
    { path: 'noticia/:club', component: NoticiaPlistAdminRouted}
];
