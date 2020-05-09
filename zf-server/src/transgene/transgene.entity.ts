import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToMany } from 'typeorm';
import {Expose, Type} from 'class-transformer';
import { Stock } from '../stock/stock.entity';

@Entity()
@Index(['allele', 'descriptor'], { unique: true })
@Index(['allele', 'descriptor', 'plasmid', 'comment', 'source'], { fulltext: true })
export class Transgene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 50,
    comment: 'Transgene descriptor which should use ZFIN nomenclature.',
  })
  descriptor: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  allele: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 40,
    comment: 'Describes the source (lab or researcher) of the transgene.',
  })
  source: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 250,
  })
  plasmid: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 3000,
    comment: 'Notes pertaining to this transgene.',
  })
  comment: string;

  @Column({
    type: 'int',
    nullable: true,
    unique: true,
    comment: 'This is the serial number for "owned" transgenes.',
  })
  serialNumber: number;

  @Type(() => Stock)
  @ManyToMany(type => Stock, stock => stock.transgenes)
  stocks: Stock[];

  isDeletable: boolean = false;

  isOwned(): boolean {
    return !!(this.serialNumber);
  }

  @Expose()
  get fullName(): string {
    const name: string[] = [];
    if (this.descriptor) { name.push(this.descriptor); }
    if (this.allele) { name.push(this.allele); }
    return name.join(': ');
  }

  @Expose()
  get name(): string {
    return this.fullName;
  }

  // This just makes a string that can be used as a tooltip when
  // hovering over a mutation in the GUI.
  // I'm really unhappy about this
  // a) because it duplicates pretty much all of the mutation data, and
  // b) because tooltips are really the domain of the client.
  // The alternative is that this gets computed on the client side.  But in order to do
  // THAT, I'd have to create a "real" object on the client side rather than just a DTO.
  // And doing that turns the client into a significantly more complicated thing that has
  // to have another whole layer of objects and converters.
  // So For now, I'll take the pain.
  @Expose()
  get tooltip(): string {
    const strings: string[] = [];
    if (this.source) {
      strings.push('source: ' + this.source);
    }
    if (this.plasmid) {
      strings.push('plasmid: ' + this.plasmid);
    }
    if (this.comment) {
      strings.push('comment: ' + this.comment.substr(0, 50));
    }
    return strings.join('\n');
  }
}
