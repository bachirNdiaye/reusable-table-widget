# Reusable Table Widget

## Architecture

The app is built around a standalone smart component `TableWidgetComponent` that contains two main children

- `FilterBarComponent` which contains the filters
- `DataTableComponent` which displays the data with sorting, pagination, selection etc.

and finally a `ContextMenuComponent` that handles the row action menu

app
  components
    context-menu
    data-table
    filter-bar
    table-widget
  data (PS: The mock data is expressely generated to have a large variety of values for testing purpose)
    mock-servers
  models
    filter-definition
    server
    table-action
    table-query
  store
    table-state

## State Management Strategy

All state management is handles in `TableStateService` using Angular Signals

- `signal()` is used for state and `computed()` for calculated state
- Components can read signals directly and call store to update state
- Only UI-only state is handle in 'dumb' components

## Tech choice
- The choice of Angular Signals is made over RxJS because of it's simplicity and efficiancy. The state is local and precise.
- No UI library has been used, only HTML & CSS to avoid unnecessary dependencies and go quick
- Angular CDK is used for columns drag and drop
- trackBy inside @for track for performance with large lists

## How to run ?

npm install
ng serve # port 4200
ng test

