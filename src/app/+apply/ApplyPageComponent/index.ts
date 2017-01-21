import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  Opp,
  OppService,
  Project,
  ProjectService,
  RequestService,
  Request,
  UserService,
 } from '../../sn-firebase';

export type ApplyPageSources = {
  opp_: Observable<Opp>,
  project_: Observable<Project>,
  request_: Observable<Request>,
};

@Injectable()
export class ApplyPageResolver implements Resolve<ApplyPageSources> {
    constructor(
      public opps: OppService,
      public projects: ProjectService,
      public requests: RequestService,
      public users: UserService,
    ) {}

    public resolve(route: ActivatedRouteSnapshot): Observable<ApplyPageSources> {
      const opp_ = this.opps.byKey(route.params['oppKey']);
      const project_ = this.projects.byKey(route.params['projectKey']);
      const request_ = this.users.uid$
        .switchMap(uid => this.requests.byKey(uid + route.params['oppKey']));
      const sources = {
        opp_,
        project_,
        request_,
      };
      return Observable.combineLatest(opp_, project_, request_)
        .map(() => sources)
        .first();
    }
}

@Component({
  selector: 'apply',
  styleUrls: [ './index.css' ],
  template: `
<div fxLayout='column' fxFill>
  <app-bar></app-bar>
  <div fxLayout='row'>
    <img src=''/>
    <div fxFlex fxLayout='column'>
      <h1>{{(project_ | async)?.name}}</h1>
      <h2>Date & Location</h2>
    </div>
  </div>
  <div>
    Complete your request to join {{(opp_ | async)?.name}}
  </div>
  <apply-wizard [opp_]='opp_' fxFlex></apply-wizard>
</div>
`
})
export class ApplyPageComponent {
  public sources: ApplyPageSources;
  public opp_: Observable<Opp>;
  public project_: Observable<Project>;
  // public request_: Observable<Request>;

  constructor(
    public oppService: OppService,
    public projectService: ProjectService,
    public requestService: RequestService,
    public userService: UserService,
    public route: ActivatedRoute,
  ) {
    console.log('route data', route.data);
    this.sources = route.snapshot.data['sources'];
    this.opp_ = this.sources.opp_;
    this.project_ = this.sources.project_;

    // this.project_ = projectService.byKey(route.snapshot.params['projectKey']);
    // this.request_ = userService.uid$
      // .switchMap(uid => requestService.byKey(uid + route.snapshot.params['oppKey']));
  }

}
