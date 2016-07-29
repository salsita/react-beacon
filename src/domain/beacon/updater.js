import { Updater } from 'redux-elm';

const initialModel = {};

export default new Updater(initialModel)
  .toReducer();
