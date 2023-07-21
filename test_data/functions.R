f1 <- function() cat("f1")

f2 <- function() {
  cat("f2")
}

#' @title Sum of Vector Elements
#' @description f3 returns the sum of all the values present in its arguments.
#' @param a Already documented
#' @param b TODO
#' @param z This parameter should be removed. And parameter x should be shown
#' instead.
#' @param ... unused
#' @details This is a generic function: methods can be defined for it directly
#' or via the Summary group generic. For this to work properly, the arguments
#' ... should be unnamed, and dispatch is on the first argument.
#' @export
f2 <- function(a, b, x = 1, ...) {
  cat("f3")
}

# Strangely formatted function definition
f4    = function(a,
             b,
      x = {function(z) {x^2} (3)},
   ...
) { cat(a, b, x)
    }
