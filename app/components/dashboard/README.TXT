Unified UI
==========

This directory contains the new UI for Whole Tale.  There is a single unified view component
which is divided into two sections: left-panel and right-panel.  The view templates in /templates
just use this component. The each dashboard menu item has its own subdirectory that contains
the specific internals for each view.  This is EmberJS components on steriods....

Directories
===========

unified-view - is the core template for the structure of the unified view interface. If
you change this then the unified view will change for all pages
browse - the UI for the browse menu
manage - the UI for the manage menu
run - the UI for the run menu
compose - the UI for the compose menu
