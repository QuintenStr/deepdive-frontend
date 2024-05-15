import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipeline } from '../pipes/truncate.pipe';
@NgModule({
  declarations: [TruncatePipeline],
  imports: [CommonModule],
  exports: [TruncatePipeline],
})
export class SharedModule {}
