---
layout: post
title:  "Convergence tests for series"
date:   2021-04-17 15:29:00 -0700
categories: [math notes]
tags: calculus
published: false
---

**NOTE**: Some of the following borrows phrasing from materials from [PCC](https://www.pcc.edu) Math 253.

## The big question:
Given an sequence $a_n$, does the series $\sum_{n=1}^\infty a_n$ converge?

### Choosing a test
https://www.youtube.com/watch?v=0wefqjpQyKM

#### Cabn $a_n$ be rewritten as $ar^n$, where $r$ and $n$ are constants?
Use the [Geometric Series Test].

#### Can $a_n$ be rewritten as $(-1)^{n-1}b_n$?
Consider the [Divergence Test](#divergence-test) and the [Alternating Series Test](#alternating-series-test).

#### Does $a_n$ contain a factorial?
Consider the [Ratio T est](#ratio-test).
  
#### Does $a_n$ contain a geometric component e.g. $A(r)^{n-1}$ ?
Consider the [Ratio Test](#ratio-test). 
  
#### Does $a_n$ resemble a $p$-series, but it's not a $p$-series, e.g. $\sum \frac{1}{(n+1)^2}$?
Consider the [Comparison Test](#comparison-test) or [Limit Comparison Test](#limit-comparison-test)
    

#### Last resort
For something nasty, the integral test is always there.
$\sum_{n=1}^\ifnty ne^{-n^2}$

### Table of Contents
1. [$p$-Series Test](#p-series-test)
2. [Geometric Series Test](#geometric-series-test)
3. [Divergence Test](#divergence-test)
4. [Integral Test](#integral-test)
5. [Comparison Test](#comparison-test)
6. [Limit Comparison Test](#limit-comparison-test)
7. [Alternating Series Test](#alternating-series-test)
8. [Absolute Convergence Test](#absolute-convergence-test)
9. [Ratio Test](#ratio-test)
10. [Root Test](#root-test)

<!-- ---------------------------------- -->
### $p$-Series Test


<!-- ---------------------------------- -->
### Geometric Series Test

If you have a _geometric series_  $\sum_{n=1}^\infty a_n$ that can be written in the form $\sum_{n=1}^\infty ar^n$, 
where $a$ and $r$ are constants, e.g.


$$
\begin{align*} 
\sum_{n=1}^\infty 3\left(\frac{1}{2}\right)^n
\end{align*}
$$

then

* If $\|r\| < 1$, the series converges to $\frac{a}{1-r}$.
* If $\|r\| \ge 1$, the series diverges.

<!-- ---------------------------------- -->
### Divergence Test

$$
\begin{align*} 
\lim_{n\to\infty} \ne 0 
  ~~ \Rightarrow ~~ \sum_{n=1}^\infty a_n~~\text{diverges}
\end{align*}
$$



<!-- ---------------------------------- -->
### Integral Test



If you have a series $\sum a_n$, consider $a_n$ as a function $f(x)$. If $f(x)$ is **(1) continuous, 
(2) positive, and (3) decreasing**, then

$$
\begin{align*} 
& \sum_{n=1}^\infty a_n ~~ \text{converges if} ~~ \int_1^\infty f(x)dx ~~ \text{converges}.
\\\\
& \sum_{n=1}^\infty a_n ~~ \text{diverges if} ~~ \int_1^\infty f(x)dx ~~ \text{diverges}.
\end{align*}
$$

<!-- ---------------------------------- -->
### Comparison Test

For a series $\sum a_n$, compare to another series with known convergence/divergence
$\sum_{n=1}^\infty b_n$.

* If $\sum b_n$ converges, and $a_n \le b_n$ for all $n$, then 
  $\sum a_n$ also converges.
* If $\sum b_n$ diverges, and $a_n \ge b_n$ for all $n$, then 
  $\sum a_n$ also diverges.
* Otherwise, the comparison test is inconclusive.


<!-- ---------------------------------- -->
### Limit Comparison Test

Take $\sum a_n$ and $\sum b_n$, two series with positive terms. If

$$
\begin{align*}
\lim_{n\to\infty}\frac{a_n}{b_n} = c > 0 
\end{align*}
$$

then \sum a_n and \sum b_n either both converge or both diverge. 

<!-- ---------------------------------- -->
### Alternating Series Test

If you have an _alternating series_ $\sum_{n=1}^\infty a_n$ that can be written in the form

$$
\begin{align*} 
\sum_{n=1}^\infty (-1)^n b_n & & or & & \sum_{n=1}^\infty (-1)^{n-1} b_n
\end{align*}
$$

where $b_n$ is 
* positive
* decreasing, and
* has a limit of 0

then $\sum_{n=1}^\infty a_n$  converges.


<!-- ---------------------------------- -->
### Absolute Convergence Test

If the series $\sum \| a_n \| $ is convergent, i.e. it is _absolutely convergent_, then $\sum a_n$ is convergent.


<!-- ---------------------------------- -->
### Ratio Test

Given a series $\sum a_n$, find the ratio $L$ of $a_{n+1}$ to $a_n$ as $n$ approaches infinity:

$$
\begin{align*} 
& L=\lim_{n\to\infty} \left|\frac{a_{n+1}}{a_n}\right|
\\\\
& L < 1 ~~ \Rightarrow ~~ \sum a_n ~~ \text{converges.}
\\\\
& L > 1 ~~ \Rightarrow ~~ \sum a_n ~~ \text{diverges.}
\\\\
& L = 1 ~~ \text{is an inconclusive result.}
\end{align*}
$$

#### When to use the Ratio Test

Works well with series that have a geometric component, e.g. $(\frac{1}{2})^n$ or a factorial component $n!$.

#### When NOT to use the Ratio Test

However, if the series is a $p$-series, the ratio test is likely to be inconclusive, so it's worth avoiding in those 
situations.


<!-- ---------------------------------- -->
### Root Test
