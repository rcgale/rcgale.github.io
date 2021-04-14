---
layout: post
title:  "Partial fractions and telescoping series"
date:   2021-04-11 14:52:00 -0700
categories: [math notes]
tags: calculus 
---

Factorize to find the two denominators we want.

$$
\begin{align*} 
\sum_{n=1}^\infty \frac{2}{n^2+6n+8}
    &= \sum_{n=1}^\infty \frac{2}{(n+2)(n+4)}
\\\\
    &= \sum_{n=1}^\infty \frac{A}{n+2} + \frac{B}{n+4}
\end{align*}
$$

Find $A$ and $B$

$$
\begin{align*}
2  &= A(n+4) + B(n+2)\\\\
\end{align*}
$$

$$
\begin{align*}
      & \text{let}~n = -2            &    &\text{let}~n = -4
\\\\
    2 &= A(-2+4) + B(-2+2)           &  2 &= A(-4+4) + B(-4+2) 
\\\\
    2 &= A(2)                        &  2 &= B(-2)              
\\\\
    1 &= A                           & -1 &= B                  
\end{align*}
$$

Plug it back in

$$
\begin{align*} 
\sum_{n=1}^\infty \frac{A}{n+4} + \frac{B}{n+2}
    &= \sum_{n=1}^\infty \frac{1}{n+2} - \frac{1}{n+4}
\\\\
    &= \sum_{n=1}^\infty \frac{1}{n+2} - \sum_{n=1}^\infty \frac{1}{n+4}
\\\\
    &= \sum_{n=1}^\infty \biggr\{
        \frac{1}{3}, \frac{1}{4}, \frac{1}{5}, ..., \frac{1}{n+1}, \frac{1}{n+2} \biggr\} -
        \sum_{n=1}^\infty \biggr\{ \frac{1}{5}, \frac{1}{6}, \frac{1}{7}, ..., \frac{1}{n+3}, \frac{1}{n+4} \biggr\}
\\\\
    &= \lim_{n\to\infty}
    \frac{1}{3} + \frac{1}{4} + \biggr( \frac{1}{5} - \frac{1}{5} \biggr) + \biggr( \frac{1}{6} - \frac{1}{6} \biggr) + ...
      + \biggr( \frac{1}{n+1} - \frac{1}{n+1} \biggr) + \biggr( \frac{1}{n+2} - \frac{1}{n+2} \biggr) + \frac{1}{n+3} + \frac{1}{n+4}
\\\\
    &= \lim_{n\to\infty}
    \frac{1}{3} + \frac{1}{4} + \frac{1}{n+3} + \frac{1}{n+4}
\\\\
    &= \frac{1}{3} + \frac{1}{4}
\\\\
    &= \frac{7}{12}
\end{align*}
$$
