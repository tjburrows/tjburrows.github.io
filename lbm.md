---
layout: default
permalink: /lbm/
title: LBM in JS
---
## Lid Driven Cavity in Javascript
The following is an in-browser computational fluid dynamics (CFD) solver for the basic 2D problem called Lid Driven Cavity.  In this problem, fluid is bounded by walls on all four sides of a square domain, where all sides are stationary, except the top wall which moves left to right.  It is solved with a method called Lattice Boltzmann Method, which is very computationally efficient, allowing me to implement it in a web browser for fun.

Choose from a few different grid sizes and Reynolds numbers (speed of the wall) and click start to compute the solution on your own device.  The velocity magnitude and convergence as a function of iteration are plotted in the first row, while comparisons of the results with literature (Ghia et al.) are plotted below for a couple centerline velocity profiles.

Note that this is optimized for computer web browsers, and not mobile devices.

{% include lbm.html %}
