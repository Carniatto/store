import { Injectable } from '@angular/core';
import {
  getActionTypeFromInstance,
  getValue,
  NgxsNextPluginFn,
  NgxsPlugin,
  setValue
} from '@ngxs/store';
import {
  ResetForm,
  SetFormDirty,
  SetFormDisabled,
  SetFormEnabled,
  SetFormPristine,
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue
} from './actions';

@Injectable()
export class NgxsFormPlugin implements NgxsPlugin {
  handle(state: any, event: any, next: NgxsNextPluginFn) {
    const type = getActionTypeFromInstance(event);

    let nextState = state;

    if (type === UpdateFormValue.type || type === UpdateForm.type || type === ResetForm.type) {
      const { value } = event.payload;
      const payloadValue = Array.isArray(value)
        ? value.slice()
        : isObjectLike(value)
        ? { ...value }
        : value;
      const path = this.joinPathWithPropertyPath(event);
      nextState = setValue(nextState, path, payloadValue);
    }

    if (type === ResetForm.type) {
      const model = getValue(nextState, `${event.payload.path}.model`);
      nextState = setValue(nextState, `${event.payload.path}`, { model: model });
    }

    if (type === UpdateFormStatus.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.status`, event.payload.status);
    }

    if (type === UpdateFormErrors.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.errors`, {
        ...event.payload.errors
      });
    }

    if (type === UpdateFormDirty.type || type === UpdateForm.type) {
      nextState = setValue(nextState, `${event.payload.path}.dirty`, event.payload.dirty);
    }

    if (type === SetFormDirty.type) {
      nextState = setValue(nextState, `${event.payload}.dirty`, true);
    }

    if (type === SetFormPristine.type) {
      nextState = setValue(nextState, `${event.payload}.dirty`, false);
    }

    if (type === SetFormDisabled.type) {
      nextState = setValue(nextState, `${event.payload}.disabled`, true);
    }

    if (type === SetFormEnabled.type) {
      nextState = setValue(nextState, `${event.payload}.disabled`, false);
    }

    return next(nextState, event);
  }

  private joinPathWithPropertyPath({ payload }: UpdateFormValue): string {
    let path = `${payload.path}.model`;

    if (payload.propertyPath) {
      path += `.${payload.propertyPath}`;
    }

    return path;
  }
}

function isObjectLike(target: unknown): target is object {
  return target !== null && typeof target === 'object';
}
