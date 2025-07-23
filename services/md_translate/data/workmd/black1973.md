# The Pricing of Options and Corporate Liabilities

**Fischer Black<sup>1</sup>, Myron Scholes<sup>2</sup>**

<sup>1</sup> University of Chicago
<sup>2</sup> Massachusetts Institute of Technology

<sup>☆</sup> Received for publication November 11,1970. Final version received May 9,1972. The inspiration for this work was provided by Jack L. Treynor (1961a, 1961b). We are grateful for extensive comments on earlier drafts by Eugene F. Fama, Robert C. Merton, and Merton H. Miller. This work was supported in part by the Ford Foundation.

---

**Abstract**

If options are correctly priced in the market, it should not be possible to make sure profits by creating portfolios of long and short positions in options and their underlying stocks. Using this principle, a theoretical valuation formula for options is derived. Since almost all corporate liabilities can be viewed as combinations of options, the formula and the analysis that led to it are also applicable to corporate liabilities such as common stock, corporate bonds, and warrants. In particular, the formula can be used to derive the discount that should be applied to a corporate bond because of the possibility of default.

## Introduction

An option is a security giving the right to buy or sell an asset, subject to certain conditions, within a specified period of time. An "American option" is one that can be exercised at any time up to the date the option expires. A "European option" is one that can be exercised only on a specified future date. The price that is paid for the asset when the option is exercised is called the "exercise price" or "striking price." The last day on which the option may be exercised is called the "expiration date" or "maturity date."

The simplest kind of option is one that gives the right to buy a single share of common stock. Throughout most of the paper, we will be discussing this kind of option, which is often referred to as a "call option."

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and-c)

<!-- Page:0 -->

In general, it seems clear that the higher the price of the stock, the greater the value of the option. When the stock price is much greater than the exercise price, the option is almost sure to be exercised. The current value of the option will thus be approximately equal to the price of the stock minus the price of a pure discount bond that matures on the same date as the option, with a face value equal to the striking price of the option.

On the other hand, if the price of the stock is much less than the exercise price, the option is almost sure to expire without being exercised, so its value will be near zero.

If the expiration date of the option is very far in the future, then the price of a bond that pays the exercise price on the maturity date will be very low, and the value of the option will be approximately equal to the price of the stock.

On the other hand, if the expiration date is very near, the value of the option will be approximately equal to the stock price minus the exercise price, or zero, if the stock price is less than the exercise price. Normally, the value of an option declines as its maturity date approaches, if the value of the stock does not change.

These general properties of the relation between the option value and the stock price are often illustrated in a diagram like figure 1. Line $A$ represents the maximum value of the option, since it cannot be worth more than the stock. Line $B$ represents the minimum value of the option, since its value cannot be negative and cannot be less than the stock price minus the exercise price. Lines $T_{1},T_{2},$ and $T_{3}$ represent the value of the option for successively shorter maturities.

Normally, the curve representing the value of an option will be concave upward. Since it also lies below the $45^{\mathrm{~o~}}$ line, $A$, we can see that the

<center><i>Fig. 1.—The relation between option value and stock price</i></center>

<div align="center">
  <img src="images/7c5f25bdb94aa312f7deea69eed371f0e0d5c7b281c23e756181fa81e925ddf3.jpg" style="max-width: 70%;" />
</div>

<!-- Page:1 -->

option will be more volatile than the stock. A given percentage change in the stock price, holding maturity constant, will result in a larger percentage change in the option value. The relative volatility of the option is not constant, however. It depends on both the stock price and maturity. 

Most of the previous work on the valuation of options has been expressed in terms of warrants. For example, Sprenkle (1961), Ayres (1963), Boness (1964), Samuelson (1965), Baumol, Malkiel, and Quandt (1966), and Chen (1970) all produced valuation formulas of the same general form. Their formulas, however, were not complete, since they all involved one or more arbitrary parameters. 

For example, Sprenkle's formula for the value of an option can be written as follows:

$$
kxN(b_1) - kcN(b_2)
$$

In this expression, $x$ is the stock price, $c$ is the exercise price, $t^{*}$ is the maturity date, $t$ is the current date, $v^{2}$ is the variance rate of the return on the stock, ln is the natural logarithm, and $N(b)$ is the cumulative normal density function. But $k$ and $k^{*}$ are unknown parameters. Sprenkle (1961) defines $k$ as the ratio of the expected value of the stock price at the time the warrant matures to the current stock price, and $k^{*}$ as a discount factor that depends on the risk of the stock. He tries to estimate the values of $k$ and $k^{*}$ empirically, but finds that he is unable to do so.

More typically, Samuelson (1965) has unknown parameters $\alpha$ and $\beta$ where $\alpha$ is the rate of expected return on the stock, and $\beta$ is the rate of expected return on the warrant or the discount rate to be applied to the warrant. He assumes that the distribution of possible values of the stock when the warrant matures is log-normal and takes the expected value of this distribution, cutting it off at the exercise price. He then discounts this expected value to the present at the rate $\beta$. Unfortunately, there seems to be no model of the pricing of securities under conditions of capital market

---

1 The variance rate of the return on a security is the limit, as the size of the interval of measurement goes to zero, of the variance of the return over that interval divided by the length of the interval. 2 The rate of expected return on a security is the limit, as the size of the interval of measurement goes to zero, of the expected return over that interval divided by the length of the interval.

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ill use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:2 -->

equilibrium that would make this an appropriate procedure for determining the value of a warrant. 

In a subsequent paper, Samuelson and Merton (1969) recognize the fact that discounting the expected value of the distribution of possible values of the warrant when it is exercised is not an appropriate procedure. They advance the theory by treating the option price as a function of the stock price. They also recognize that the discount rates are determined in part by the requirement that investors be willing to hold all of the outstanding amounts of both the stock and the option. But they do not make use of the fact that investors must hold other assets as well, so that the risk of an option or stock that affects its discount rate is only that part of the risk that cannot be diversified away. Their final formula depends on the shape of the utility function that they assume for the typical investor. 

One of the concepts that we use in developing our model is expressed by Thorp and Kassouf (1967). They obtain an empirical valuation formula for warrants by fitting a curve to actual warrant prices. Then they use this formula to calculate the ratio of shares of stock to options needed to create a hedged position by going long in one security and short in the other. What they fail to pursue is the fact that in equilibrium, the expected return on such a hedged position must be equal to the return on a riskless asset. What we show below is that this equilibrium condition can be used to derive a theoretical valuation formula. 

## The Valuation Formula

In deriving our formula for the value of an option in terms of the price of the stock, we will assume “ideal conditions" in the market for the stock and for the option:

$^{a}$) The short-term interest rate is known and is constant through time. $^{b}$) The stock price follows a random walk in continuous time with a variance rate proportional to the square of the stock price. Thus the distribution of possible stock prices at the end of any finite interval is lognormal. The variance rate of the return on the stock is constant. $^{c}$) The stock pays no dividends or other distributions. $^{d}$) The option is “European,” that is, it can only be exercised at maturity. $^{e}$) There are no transaction costs in buying or selling the stock or the option. $^{f}$) It is possible to borrow any fraction of the price of a security to buy it or to hold it, at the short-term interest rate. $^{g}$) There are no penalties to short selling. A seller who does not own a security will simply accept the price of the security from a buyer, and will agree to settle with the buyer on some future date by paying him an amount equal to the price of the security on that date.

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ll use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:3 -->

Under these assumptions, the value of the option will depend only on the price of the stock and time and on variables that are taken to be known constants. Thus, it is possible to create a hedged position, consisting of a long position in the stock and a short position in the option, whose value will not depend on the price of the stock, but will depend only on time and the values of known constants. Writing $w(x,t)$ for the value of the option as a function of the stock price $x$ andtime $t$ , the number of options that must be sold short against one share of stock long is:

$$
\begin{array}{r}{1/w_{1}(x,t).\qquad(1)}\end{array}
$$

In expression (1), the subscript refers to the partial derivative of $w(x,t)$ with respect to its first argument.

To see that the value of such a hedged position does not depend on the price of the stock, note that the ratio of the change in the option value to the change in the stock price, when the change in the stock price is small, is $\ w_{1}(x,t)$ . To a first approximation, if the stock price changes by an amount $\Delta x$ , the option price will change by an amount $\mathcal{w}_{1}(x,t)~\Delta x$ ,and the number of options given by expression (1） will change by an amount $\Delta x$ Thus, the change in the value of a long position in the stock will be approximately offset by the change in value of a short position in $1/w_{1}$ options.

As the variables $x$ and $t$ change, the number of options to be sold short to create a hedged position with one share of stock changes. If the hedge is maintained continuously, then the approximations mentioned above become exact, and the return on the hedged position is completely independent of the change in the value of the stock. In fact, the return on the hedged position becomes certain.[^1]

To illustrate the formation of the hedged position, let us refer to the solid line $(T_{\mathrm{{2}}})$ in figure 1 and assume that the price of the stock starts at $\$15.00$ , So that the value of the option starts at $\$5.00$ . Assume also that the slope of the line at that point is $^{1,/2}$ . This means that the hedged position is created by buying one share of stock and selling two options short. One share of stock costs $\$15.00$ , and the sale of two options brings in $\$10.00$ , so the equity in this position is $\$5.00$

If the hedged position is not changed as the price of the stock changes, then there is some uncertainty in the value of the equity at the end of a finite interval. Suppose that two options go from $\$10.00$ to $\$15.75$ when the stock goes from $\$15.00$ to $\$20.00$ , and that they go from $\$10.00$ to $\$5.75$ when the stock goes from $\$15.00$ to $\$10.00$ . Thus, the equity goes from $\$5.00$ to $\$4.25$ when the stock changes by $\$5.00$ in either direction. This is a $\$75$ decline in the equity for a $\$5.00$ change in the stock in either direction.[^2]

---

[^1]: This was pointed out to us by Robert Merton.

[^2]: These figures are purely for illustrative purposes. They correspond roughly to the way figure 1 was drawn, but not to an option on any actual security.

<!-- Page:4 -->

In addition, the curve shifts (say from $T_{2}$ to $T_{3}$ in fig.1) as the maturity of the options changes. The resulting decline in value of the options means an increase in the equity in the hedged position and tends to offset the possible losses due to a large change in the stock price.

Note that the decline in the equity value due to a large change in the stock price is small. The ratio of the decline in the equity value to the magnitude of the change in the stock price becomes smaller as the magnitude of the change in the stock price becomes smaller.

Note also that the direction of the change in the equity value is independent of the direction of the change in the stock price. This means that under our assumption that the stock price follows a continuous random walk and that the return has a constant variance rate, the covariance between the return on the equity and the return on the stock will be zero. If the stock price and the value of the “market portfolio’ follow a joint continuous random walk with constant covariance rate, it means that the covariance between the return on the equity and the return on the market will be zero.

Thus the risk in the hedged position is zero if the short position in the option is adjusted continuously. If the position is not adjusted continuously, the risk is small, and consists entirely of risk that can be diversified away by forming a portfolio of a large number of such hedged positions.

In general, since the hedged position contains one share of stock long and $1/w_{1}$ options short, the value of the equity in the position is:

$$
x-w/w_{1}.\qquad(2)
$$

The change in the value of the equity in a short interval $\Delta t$ is:

$$
\Delta x - \Delta w/w_1. \tag{3}
$$

Assuming that the short position is changed continuously, we can use stochastic calculus to expand $\Delta w$ ,whichis $\boldsymbol{w}(\boldsymbol{x}+\Delta\boldsymbol{x},t+\Delta{t})-\boldsymbol{w}(\boldsymbol{x},t)$ as follows:

$$
\Delta w = w_1 \Delta x + \frac{1}{2} w_{11} v^2 x^2 \Delta t + w_2 \Delta t. \tag{4}
$$

In equation (4), the subscripts on $\boldsymbol{\mathfrak{w}}$ refer to partial derivatives, and $v^{2}$ is the variance rate of the return on the stock.6 Substituting from equation (4) into expression (3), we find that the change in the value of the equity in the hedged position is:

$$
-\left(\frac{1}{2} w_{11} v^2 x^2 + w_2\right) \Delta t / w_1 \tag{5}.
$$

Since the return on the equity in the hedged position is certain, the return must be equal to $r\Delta t$ . Even if the hedged position is not changed

---

5For an exposition of stochastic calculus, see McKean (1969).

6 See footnote 1.

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:5 -->

continuously, its risk is small and is entirely risk that can be diversified away, so the expected return on the hedged position must be at the short term interest rate.[^1] If this were not true, speculators would try to profit by borrowing large amounts of money to create such hedged positions, and would in the process force the returns down to the short term interest rate. 

Thus the change in the equity (5) must equal the value of the equity (2) times $r\Delta t$ 

$$
-\left(\frac{1}{2}w_{11}v^2x^2 + w_2\right)\Delta t/w_1 = (x - w/w_1)r\Delta t. \tag{6}
$$

Dropping the $\Delta t$ from both sides, and rearranging, we have a differential equation for the value of the option. 

$$
w_2 = rw - rxw_1 - \frac{1}{2} v^2x^2w_{11}. \tag{7}
$$

Writing $t^*$ for the maturity date of the option, and $c$ for the exercise price, we know that: 

$$
w(x,t^*) = x - c, \qquad x \geqslant c \tag{8}\\ = 0, \qquad x < c.
$$

There is only one formula $\boldsymbol{w}(\boldsymbol{x},t)$ that satisfies the differential equation (7) subject to the boundary condition (8). This formula must be the option valuation formula. 

To solve this differential equation, we make the following substitution: 

$$
w(x,t) = e^{r(t-t^*)} y \left[ \left( \frac{2}{v^2} \right) \left( r - \frac{1}{2} v^2 \right) \right. \left. \left[ \ln \frac{x}{c} - \left( r - \frac{1}{2} v^2 \right) (t - t^*) \right] \right],
$$

$$
-\left(2/v^2\right)\left(r - \frac{1}{2}v^2\right)(t - t^*) \tag{9}
$$

For a thorough discussion of the relation between risk and expected return, see Fama and Miller (1972) or Sharpe (1970). To see that the risk in the hedged position can be diversified away, note that if we don't adjust the hedge continuously, expression (5) becomes: 

$$
-\left(\frac{1}{2}w_{11}\Delta x^{2} + w_{2}\Delta t\right)/w_{1}. \tag{5'}
$$

Writing $\Delta m$ for the change in the value of the market portfolio between $t$ and $t+\Delta t$, the “market risk" in the hedged position is proportional to the covariance between the change in the value of the hedged portfolio, as given by expression $(5')$, and $\Delta m$ $-\frac{1}{2}w_{11}\mathrm{cov}(\Delta x^2,\Delta m)$. But if $\Delta x$ and $\Delta m$ follow a joint normal distribution for small intervals $\Delta t$, this covariance will be zero. Since there is no market risk in the hedged position, all of the risk due to the fact that the hedge is not continuously adjusted must be risk that can be diversified away. 

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and-c). 

[^1]: For a thorough discussion of the relation between risk and expected return, see Fama and Miller (1972) or Sharpe (1970). To see that the risk in the hedged position can be diversified away, note that if we don't adjust the hedge continuously, expression (5) becomes:

<!-- Page:6 -->

With this substitution, the differential equation becomes:

$$
y_{2}=y_{11}, \qquad(10)
$$

and the boundary condition becomes:

$$
y(u,0) = 0, \qquad u < 0
$$

The differential equation (10) is the heat-transfer equation of physics, and its solution is given by Churchill (1963, p. 155). In our notation, the solutionis:

$$
y(u,s) = \frac{1}{\sqrt{2\pi}} \int_{-u/\sqrt{2s}}^{\infty} c \left[ e^{(u + q\sqrt{2s})\left(\frac{1}{2}v^2\right) / \left(r - \frac{1}{2}v^2\right) - 1} \right] e^{-q^2/2} \, dq. \tag{12}
$$

Substituting from equation (12) into equation (9), and simplifying, we find:

$$
v(x,t)=xN(d_{1})-ce^{r(t-t^{*})}N(d_{2})
$$

In equation (13), $N(d)$ is the cumulative normal density function.

Note that the expected return on the stock does not appear in equation (13). The option value as a function of the stock price is independent of the expected return on the stock. The expected return on the option, however, will depend on the expected return on the stock. The faster the stock price rises, the faster the option price will rise through the functional relationship (13).

Note that the maturity $\left(t^{*}-t\right)$ appears in the formula only multiplied by the interest rate $\boldsymbol{r}$ or the variance rate $v^{2}$. Thus, an increase in maturity has the same effect on the value of the option as an equal percentage increase in both $r$ and $v^{2}$.

Merton (1973) has shown that the option value as given by equation (13) increases continuously as any one of $t^{*},r,$ or $v^{2}$ increases.In each case, it approaches a maximum value equal to the stock price.

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ll use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:7 -->

The partial derivative $w_{1}$ of the valuation formula is of interest, because it determines the ratio of shares of stock to options in the hedged position as in expression (1). Taking the partial derivative of equation (13), and simplifying, we find that:

<!-- Page:8 -->

To apply the capital-asset pricing model to an option and the underlying stock, let us first define $a$ as the rate of expected return on the market minus the interest rate.[^1] Then the expected return on the option and the stock are:

$$
E(\Delta x/x) = r \Delta t + \alpha \beta_x \Delta t, \tag{16}
$$

$$
E(\Delta w / w) = r \Delta t + \alpha \beta_w \Delta t \tag{17}
$$

Multiplying equation (17) by $\ell$, and substituting for $\beta_{w}$ from equation (15), we find:

$$
E(\Delta w) = rw\Delta t + axw_1\beta_x\Delta t. \tag{18}
$$

Using stochastic calculus, we can expand $\Delta w$, which is $\displaystyle w(x+\Delta x, t+\Delta t)-w(x,t)$, as follows:

$$
\Delta w = w_1 \Delta x + \frac{1}{2} w_{11} v^2 x^2 \Delta t + w_2 \Delta t. \tag{19}
$$

Taking the expected value of equation (19), and substituting for $E(\Delta x)$ from equation (16), we have:

$$
E(\Delta w) = rxw_1\Delta t + axw_1\beta_x\Delta t + \frac{1}{2}v^2x^2w_{11}\Delta t + w_2\Delta t. \tag{20}
$$

Combining equations (18) and (20), we find that the terms involving $a$ and $\beta_{x}$ cancel, giving:

$$
w_2 = rw - rxw_1 - \frac{1}{2} v^2 x^2 w_{11}. \tag{21}
$$

Equation (21) is the same as equation (7).

## More Complicated Options

The valuation formula (13) was derived under the assumption that the option can only be exercised at time $t^{*}$. Merton (1973) has shown, however, that the value of the option is always greater than the value it would have if it were exercised immediately $(x-c)$. Thus, a rational investor will not exercise a call option before maturity, and the value of an American call option is the same as the value of a European call option.

There is a simple modification of the formula that will make it applicable to European put options (options to sell) as well as call options (options to buy). Writing $\mathbf{u}(\mathbf{x},t)$ for the value of a put option, we see that the differential equation remains unchanged.

---

See footnote 2.

For an exposition of stochastic calculus, see McKean (1969).

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and.

<!-- Page:9 -->

$$
\nu_2 = ru - rxu_1 - \frac{1}{2} v^2 x^2 u_{11}. \tag{22}
$$

The boundary condition, however, becomes: 

$$
\nu(x,t^*) = \begin{cases} 0, & x \geqslant c \\ c - x, & x < c. \end{cases} \tag{23}
$$

To get the solution to this equation with the new boundary condition, we can simply note that the difference between the value of a call and the value of a put on the same stock, if both can be exercised only at maturity, must obey the same differential equation, but with the following boundary condition: 

$$
w(x, t^*) - u(x, t^*) \equiv x - c. \tag{24}
$$

The solution to the differential equation with this boundary condition is: 

$$
\omega(x,t) - u(x,t) = x - ce^{r(t - t^*)}. \tag{25}
$$

Thus the value of the European put option is: 

$$
u(x,t) = w(x,t) - x + ce^{r(t-t^*)} \tag{26}
$$

Putting in the value of $\boldsymbol{w}(\boldsymbol{x},t)$ from (13), and noting that $1-N(d)$ is equal to $N(-d)$, we have: 

$$
u(x,t) = -xN(-d_1) + ce^{-rt}N(-d_2). \tag{27}
$$

In equation (27), $d_{1}$ and $d_{2}$ are defined as in equation (13).

Equation (25) also gives us a relation between the value of a European call and the value of a European put. We see that if an investor were to buy a call and sell a put, his returns would be exactly the same as if he bought the stock on margin, borrowing $c e^{r(t-t^{*})}$ toward the price of the stock.

Merton (1973) has also shown that the value of an American put option will be greater than the value of a European put option. This is true because it is sometimes advantageous to exercise a put option before maturity, if it is possible to do so. For example, suppose the stock price falls almost to zero and that the probability that the price will exceed the exercise price before the option expires is negligible. Then it will pay to exercise the option immediately, so that the exercise price will be received sooner rather than later. The investor thus gains the interest on the exercise price for the period up to the time he would otherwise have exercised it. So far, no one has been able to obtain a formula for the value of an American put option.

---

11 The relation between the value of a call option and the value of a put option was first noted by Stoll (1969). He does not realize, however, that his analysis applies only to European options.

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ll use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:10 -->

If we relax the assumption that the stock pays no dividend, we begin to get into some complicated problems. First of all, under certain conditions it will pay to exercise an American call option before maturity. Merton (1973) has shown that this can be true only just. before the stock's ex-dividend date. Also, it is not clear what adjustment might be made in the terms of the option to protect the option holder against a loss due to a large dividend on the stock and to ensure that the value of the option will be the same as if the stock paid no dividend. Currently, the exercise price of a call option is generally reduced by the amount of any dividend paid on the stock. We can see that this is not adequate protection by imagining that the stock is that of a holding company and that it pays out all of its assets in the form of a dividend to its shareholders. This will reduce the price of the stock and the value of the option to zero, no matter what adjustment is made in the exercise price of the option. In fact, this example shows that there may not be any adjustment in the terms of the option that will give adequate protection against a large dividend. In this case, the option value is going to be zero after the distribution, no matter what its terms are. Merton (1973)[^1] was the first to point out that the current adjustment for dividends is not adequate.

## Warrant Valuation

A warrant is an option that is a liability of a corporation. The holder of a warrant has the right to buy the corporation's stock (or other assets) on specified terms. The analysis of warrants is often much more complicated than the analysis of simple options, because:

a) The life of a warrant is typically measured in years, rather than months. Over a period of years, the variance rate of the return on the stock may be expected to change substantially. b) The exercise price of the warrant is usually not adjusted at all for dividends. The possibility that dividends will be paid requires a modification of the valuation formula. c) The exercise price of a warrant sometimes changes on specified dates. It may pay to exercise a warrant just before its exercise price changes. This too requires a modification of the valuation formula. d) If the company is involved in a merger, the adjustment that is made in the terms of the warrant may change its value. e) Sometimes the exercise price can be paid using bonds of the corporation at face value, even though they may at the time be selling at a discount. This complicates the analysis and means that early exercise may sometimes be desirable.

f) The exercise of a large number of warrants may sometimes result in a significant increase in the number of common shares outstanding.

In some cases, these complications can be treated as insignificant, and

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ll use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

[^1]: Merton (1973) was the first to point out that the current adjustment for dividends is not adequate.

<!-- Page:11 -->

equation (13) can be used as an approximation to give an estimate of the warrant value. In other cases, some simple modifications of equation (13) will improve the approximation. Suppose, for example, that there are warrants outstanding, which, if exercised, would double the number of shares of the company's common stock. Let us define the “equity” of the company as the sum of the value of all of its warrants and the value of all of its common stock. If the warrants are exercised at maturity, the equity of the company will increase by the aggregate amount of money paid in by the warrant holders when they exercise. The warrant holders will then own half of the new equity of the company, which is equal to the old equity plus the exercise money. Thus, at maturity, the warrant holders will either receive nothing, or half of the new equity, minus the exercise money. Thus, they will receive nothing or half of the difference between the old equity and half the exercise money. We can look at the warrants as options to buy shares in the equity rather than shares of common stock, at half the stated exercise price rather than at the full exercise price. The value of a share in the equity is defined as the sum of the value of the warrants and the value of the common stock, divided by twice the number of outstanding shares of common stock. If we take this point of view, then we will take $v^{2}$ in equation (13) to be the variance rate of the return on the company's equity, rather than the variance rate of the return on the company's common stock.

A similar modification in the parameters of equation (13) can be made if the number of shares of stock outstanding after exercise of the warrants will be other than twice the number of shares outstanding before exercise of the warrants.

## Common Stock and Bond Valuation

It is not generally realized that corporate liabilities other than warrants may be viewed as options. Consider, for example, a company that has common stock and bonds outstanding and whose only asset is shares of common stock of a second company. Suppose that the bonds are “pure discount bonds” with no coupon, giving the holder the right to a fixed sum of money, if the corporation can pay it, with a maturity of 10 years. Suppose that the bonds contain no restrictions on the company except a restriction that the company cannot pay any dividends until after the bonds are paid off. Finally, suppose that the company plans to sell all the stock it holds at the end of 10 years, pay off the bond holders if possible, and pay any remaining money to the stockholders as a liquidating dividend.

Under these conditions, it is clear that the stockholders have the equivalent of an option on their company's assets. In effect, the bond holders own the company's assets, but they have given options to the stockholders

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ill use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and-(

<!-- Page:12 -->

to buy the assets back. The value of the common stock at the end of 10 years will be the value of the company's assets minus the face value of the bonds, or zero, whichever is greater.

Thus, the value of the common stock will be $\mathbf{w}(\mathbf{x},t)$, as given by equation (13), where we take $v^{2}$ to be the variance rate of the return on the shares held by the company, $c$ to be the total face value of the outstanding bonds, and $x$ to be the total value of the shares held by the company. The value of the bonds will simply be $x-\mathbf{w}(\mathbf{x},t)$

By subtracting the value of the bonds given by this formula from the value they would have if there were no default risk, we can figure the discount that should be applied to the bonds due to the existence of default risk.

Suppose, more generally, that the corporation holds business assets rather than financial assets. Suppose that at the end of the 10 year period, it will recapitalize by selling an entirely new class of common stock, using the proceeds to pay off the bond holders, and paying any money that is left to the old stockholders to retire their stock. In the absence of taxes, it is clear that the value of the corporation can be taken to be the sum of the total value of the debt and the total value of the common stock.$^{12}$ The amount of debt outstanding will not affect the total value of the corporation, but will affect the division of that value between the bonds and the stock. The formula for $\mathbf{w}(\mathbf{x},t)$ will again describe the total value of the common stock, where $x$ is taken to be the sum of the value of the bonds and the value of the stock. The formula for $x-\mathbf{w}(\mathbf{x},t)$ will again describe the total value of the bonds. It can be shown that, as the face value $c$ of the bonds increases, the market value $x-\mathbf{w}(\mathbf{x},t)$ increases by a smaller percentage. An increase in the corporation's debt, keeping the total value of the corporation constant, will increase the probability of default and will thus reduce the market value of one of the corporation's bonds. If the company changes its capital structure by issuing more bonds and using the proceeds to retire common stock, it will hurt the existing bond holders, and help the existing stockholders. The bond price will fall, and the stock price will rise. In this sense, changes in the capital structure of a firm may affect the price of its common stock.$^{13}$ The price changes will occur when the change in the capital structure becomes certain, not when the actual change takes place.

Because of this possibility, the bond indenture may prohibit the sale of additional debt of the same or higher priority in the event that the firm is recapitalized. If the corporation issues new bonds that are subordinated

---

$^{12}$The fact that the total value of a corporation is not affected by its capital structure, in the absence of taxes and other imperfections, was first shown by Modigliani and Miller (1958).

$^{13}$For a discussion of this point, see Fama and Miller (1972, pp. 151-52).

<!-- Page:13 -->

to the existing bonds and uses the proceeds to retire common stock, the price of the existing bonds and the common stock price will be unaffected. Similarly, if the company issues new common stock and uses the proceeds to retire completely the most junior outstanding issue of bonds, neither the common stock price nor the price of any other issue of bonds will be affected. 

<!-- Page:14 -->

to buy the company from the bond holders for the face value of the bonds. Call this “option 1.” After making the next-to-the-last interest payment, but before making the last interest payment, the stockholders have an option to buy option 1 by making the last interest payment. Call this "option 2." Before making the next-to-the-last interest payment, the stockholders have an option to buy option 2 by making that interest payment. This is “option 3.” The value of the stockholders’ claim at any point in time is equal to the value of option $n$, where $n$ is the number of interest payments remaining in the life of the bond.

If payments to a sinking fund are required along with interest payments, then a similar analysis can be made. In this case, there is no "balloon payment" at the end of the life of the bond. The sinking fund will have a final value equal to the face value of the bond. Option 1 gives the stockholders the right to buy the company from the bond holders by making the last sinking fund and interest payment. Option 2 gives the stockholders the right to buy option 1 by making the next-to-the-last sinking fund and interest payment. And the value of the stockholders’ claim at any point in time is equal to the value of option $n$, where $n$ is the number of sinking fund and interest payments remaining in the life of the bond. It is clear that the value of a bond for which sinking fund payments are required is greater than the value of a bond for which they are not required.

If the company has callable bonds, then the stockholders have more than one option. They can buy the next option by making the next interest or sinking fund and interest payment, or they can exercise their option to retire the bonds before maturity at prices specified by the terms of the call feature. Under our assumption of a constant short-term interest rate, the bonds would never sell above face value, and the usual kind of call option would never be exercised. Under more general assumptions, however, the call feature would have value to the stockholders and would have to be taken into account in deciding how the value of the company is divided between the stockholders and the bond holders.

Similarly, if the bonds are convertible, we simply add another option to the package. It is an option that the bond holders have to buy part of the company from the stockholders.

Unfortunately, these more complicated options cannot be handled by using the valuation formula (13). The valuation formula assumes that the variance rate of the return on the optioned asset is constant. But the variance of the return on an option is certainly not constant: it depends on the price of the stock and the maturity of the option. Thus the formula cannot be used, even as an approximation, to give the value of an option on an option. It is possible, however, that an analysis in the same spirit as the one that led to equation (13) would allow at least a numerical solution to the valuation of certain more complicated options.

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM ll use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:15 -->

## Empirical Tests

We have done empirical tests of the valuation formula on a large body of call-option data (Black and Scholes 1972). These tests indicate that the actual prices at which options are bought and sold deviate in certain systematic ways from the values predicted by the formula. Option buyers pay prices that are consistently higher than those predicted by the formula. Option writers, however, receive prices that are at about the level predicted by the formula. There are large transaction costs in the option market, all of which are effectively paid by option buyers.

Also, the difference between the price paid by option buyers and the value given by the formula is greater for options on low-risk stocks than for options on high-risk stocks. The market appears to underestimate the effect of differences in variance rate on the value of an option. Given the magnitude of the transaction costs in this market, however, this systematic misestimation of value does not imply profit opportunities for a speculator in the option market.

## References

Ayres, Herbert F. "Risk Aversion in the Warrants Market." Indus. Management Rev. 4 (Fall 1963): 497-505. Reprinted in Cootner (1967), pp. 497-505.
Baumol, William J.; Malkiel, Burton G.; and Quandt, Richard E. "The Valuation of Convertible Securities." Q.J.E. 80 (February 1966): 48-59.
Black, Fischer, and Scholes, Myron. "The Valuation of Option Contracts and a Test of Market Efficiency." J. Finance 27 (May 1972): 399-417.
Boness, A. James. "Elements of a Theory of Stock-Option Values." J.P.E. 72 (April 1964): 163-75.
Chen, Andrew H. Y. "A Model of Warrant Pricing in a Dynamic Market." J. Finance 25 (December 1970): 1041-60.
Churchill, R. V. Fourier Series and Boundary Value Problems, 2d ed. New York: McGraw-Hill, 1963.
Cootner, Paul A. The Random Character of Stock Market Prices. Cambridge, Mass.: M.I.T. Press, 1967.
Fama, Eugene F. "Multiperiod Consumption-Investment Decisions." A.E.R. 60 (March 1970): 163-74.
Fama, Eugene F., and Miller, Merton H. The Theory of Finance. New York: Holt, Rinehart & Winston, 1972.
Lintner, John. "The Valuation of Risk Assets and the Selection of Risky Investments in Stock Portfolios and Capital Budgets." Rev. Econ. and Statis. 47 (February 1965): 768-83.
McKean, H. P., Jr. Stochastic Integrals. New York: Academic Press, 1969.
Merton, Robert C. "Theory of Rational Option Pricing." Bell J. Econ. and Management Sci. (1973): in press.
Miller, Merton H., and Modigliani, Franco. "Dividend Policy, Growth, and the Valuation of Shares." J. Bus. 34 (October 1961): 411-33.
Modigliani, Franco, and Miller, Merton H. "The Cost of Capital, Corporation Finance, and the Theory of Investment." A.E.R. 48 (June 1958): 261-97.
Mossin, Jan. "Equilibrium in a Capital Asset Market." Econometrica 34 (October 1966): 768-83.

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and

<!-- Page:16 -->

Samuelson, Paul A. "Rational Theory of Warrant Pricing." Indus. Management Rev. 6 (Spring 1965): 13-31. Reprinted in Cootner (1967), pp. 506-32.
Samuelson, Paul A., and Merton, Robert C. "A Complete Model of Warrant Pricing that Maximizes Utility." Indus. Management Rev. 10 (Winter 1969): 17-46.
Sharpe, William F. "Capital Asset Prices: A Theory of Market Equilibrium Under Conditions of Risk." J. Finance 19 (September 1964): 425-42. -. Portfolio Theory and Capital Markets: New York: McGraw-Hill, 1970.
Sprenkle, Case. "Warrant Prices as Indications of Expectations." Yale Econ. Essays 1 (1961): 179-232. Reprinted in Cootner (1967), 412-74.
Stoll, Hans R. "The Relationship Between Put and Call Option Prices." J. Finance 24 (December 1969): 802-24.
Thorp, Edward O., and Kassouf, Sheen T. Beat the Market. New York: Random House,1967.
Treynor, Jack L. "Implications for the Theory of Finance." Unpublished memorandum,1961.(a) ."Toward a Theory of Market Value of Risky Assets." Unpublished memorandum,1961. (b)

---

This content downloaded from 141.218.001.105 on August 02, 2016 05:27:10 AM All use subject to University of Chicago Press Terms and Conditions (http://www.journals.uchicago.edu/t-and-c).

<!-- Page:17 -->