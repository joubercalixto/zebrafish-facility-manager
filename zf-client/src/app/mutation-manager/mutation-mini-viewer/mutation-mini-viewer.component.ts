import {Component, Input, OnInit} from '@angular/core';
import {MutationDto} from '../mutation-dto';

@Component({
  selector: 'app-mutation-mini-viewer',
  template: `
    <div class="zf-mini-title">{{mutation.fullName}}
      <span *ngIf="mutation.hasExternalLink">
        <a href="{{mutation.externalLinkURL}}" target="_blank">{{mutation.externalLinkLabel}}</a>
      </span>
    </div>
    <div *ngIf="mutation.nickname" class="zf-mini-row truncate">{{mutation.gene}}^{{mutation.name}}</div>
    <div *ngIf="mutation.phenotype" class="zf-mini-row truncate">phenotype: {{mutation.phenotype}}</div>
    <div *ngIf="mutation.comment" class="zf-mini-row truncate">{{mutation.comment}}</div>
  `,
})
export class MutationMiniViewerComponent implements OnInit {
  @Input() mutation: MutationDto;

  constructor() { }

  ngOnInit(): void {
  }

}
