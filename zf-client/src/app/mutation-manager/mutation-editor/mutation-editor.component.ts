import {Component, OnInit} from '@angular/core';
import {MutationDto} from '../mutation-dto';
import {Observable, of} from 'rxjs';
import {AbstractControl, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {MutationService} from '../mutation.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {serialize, classToPlain, plainToClass} from 'class-transformer';
import {map, startWith} from 'rxjs/operators';
import {Mutation} from '../mutation';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {DialogService} from '../../dialog.service';
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {ZF_DATE_FORMATS} from "../../helpers/dateFormats";


@Component({
  selector: 'app-mutation-editor',
  templateUrl: './mutation-editor.component.html',
  styleUrls: ['./mutation-editor.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: ZF_DATE_FORMATS},
  ],
})
export class MutationEditorComponent implements OnInit {
  item: MutationDto;
  editMode: EditMode;
  id: number;
  test: number = Math.random();
  saved = false;

  // Build the edit form.
  // Note the ".bind(this)" for name validation - it is because that
  // particular validator needs the context of this object to do its work,
  // but that is not automatically supplied as synchronous field validators
  // are typically context free.
  mfForm = this.fb.group({
    alternateGeneName: [''],
    aaChange: [''],
    actgChange: [''],
    comment: [''],
    gene: [''],
    id: [null],
    mutationType: [''],
    morphantPhenotype: [''],
    name: ['', [Validators.required, this.nameValidator.bind(this)]],
    phenotype: [''],
    researcher: ['', Validators.required],
    screenType: [''],
    spermFreezePlan: [''],
    serialNumber: [null],
    thawDate: [null],
    tillingMaleNumber: [null],
    vialsFrozen: [0],
    isDeletable: [true],
  });

// These are arrays containing options for the various filter fields
  filteredGeneOptions: Observable<string[]>;
  filteredResearcherOptions: Observable<string[]>;
  filteredMutationTypeOptions: Observable<string[]>;
  filteredScreenTypeOptions: Observable<string[]>;
  spermFreezeOptions: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: MutationService,
    private deactivationDialogService: DialogService,
  ) {}

  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      switch (pm.get('mode')) {
        case EditMode.EDIT:
          this.editMode = EditMode.EDIT;
          this.id = +pm.get('id');
          break;
        case EditMode.CREATE:
          this.editMode = EditMode.CREATE;
          break;
        case EditMode.CREATE_NEXT:
          this.editMode = EditMode.CREATE_NEXT;
          break;
        default:
        // TODO handle getting here - i.e. something is broken.
      }
      this.initialize();
    });

    this.spermFreezeOptions = this.service.spermFreezeOptions;

    // Again for the addled brain: this bit just watches what the user has typed in
    // the gene field and when it changes, it recalculates the set of remaining values
    // that kinda match what the user has typed.
    this.filteredResearcherOptions = this.mfForm.get('researcher').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('researcher', value))
    );

    this.filteredGeneOptions = this.mfForm.get('gene').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('gene', value))
    );

    this.filteredScreenTypeOptions = this.mfForm.get('screenType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('screenType', value))
    );

    this.filteredMutationTypeOptions = this.mfForm.get('mutationType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('mutationType', value))
    );
  }

  // watch for changes in the route parameters.  That is, a new navigation to the mutation editor
  initialize() {
    switch (this.editMode) {
      // in EDIT mode, get a copy of the item to edit.
      case EditMode.EDIT:
        this.service.getById(this.id).subscribe((m: MutationDto) => {
          this.item = m;
          // TODO This seems wrong. Why can I not change the name of un-owned mutations?
          this.mfForm.get('name').disable();
          this.mfForm.setValue(classToPlain(this.item));
        });
        break;

      // In CREATE mode, we make an empty item for the user to edit
      case EditMode.CREATE:
        this.item = new MutationDto();
        // can't change name of mutation unless creating it
        this.mfForm.get('name').enable();
        this.mfForm.setValue(classToPlain(this.item));
        break;

      // In CREATE_NEXT mode we pre-fill the mutation name and disallow user changes
      // Note that the name we prefill with is chosen optimistically and the real name
      // may be different if, for example, someone else created a new owned mutation
      // while the user was busy editing this one.
      case EditMode.CREATE_NEXT:
        this.item = new MutationDto();
        this.item.name = this.service.likelyNextName;
        this.mfForm.get('name').disable();
        this.mfForm.setValue(classToPlain(this.item));
    }
  }


  save() {
    this.saved = true;
    const editedDTO = new Mutation(this.mfForm.getRawValue());
    switch (this.editMode) {
      case EditMode.CREATE:
        this.service.create(editedDTO);
        break;
      case EditMode.CREATE_NEXT:
        this.service.createNext(editedDTO);
        break;
      case EditMode.EDIT:
        this.service.update(editedDTO);
        break;
    }
    this.router.navigate(['mutation_manager/view']);
  }

  cancel() {
    this.router.navigate(['mutation_manager/view']);
  }

  revert() {
    this.initialize();
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (this.service.nameIsInUse(control.value)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }

  get nameControl() {
    return this.mfForm.get('name');
  }

  getNameError() {
    if (this.nameControl.hasError('unique')) {
      return 'The name ' + this.nameControl.value + ' is already in use.';
    }
  }

  /* To support deactivation check  */
  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (this.saved) {
      return true;
    }
    if (this.mfForm.pristine) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the mutation you are editing.');
    }
  }
}

