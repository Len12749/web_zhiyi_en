<!-- Page:0 -->

# Dynamic Consumption and Portfolio Choice with Stochastic Volatility in Incomplete Markets

**George Chacko<sup>1</sup>, Luis M. Viceira<sup>1,2,3</sup> <sup>*</sup>**

<sup>1</sup> Harvard University
<sup>2</sup> CEPR
<sup>3</sup> NBER

<sup>*</sup>Corresponding author

**E-mail addresses:** Iviceira@hbs.edu (L)

<sup>☆</sup> This paper is a revised version of Working Paper 7377 of the National Bureau of Economic Research. Address correspondence to Luis M. Viceira, Harvard University, Graduate School of Business Administration, Boston MA 02163, or email: Iviceira@hbs.edu.

---

**Abstract**

This paper examines the optimal consumption and portfolio-choice problem of long-horizon investors who have access to a riskless asset with constant return and a risky asset ("stocks") with constant expected return and time-varying precision--the reciprocal of volatility. Markets are incomplete, and investors have recursive preferences defined over intermediate consumption. The paper obtains a solution to this problem which is exact for investors with unit elasticity of intertemporal substitution of consumption and approximate otherwise. The optimal portfolio demand for stocks includes an intertemporal hedging component that is negative when investors have coefficients of relative risk aversion larger than one, and the instantaneous correlation between volatility and stock returns is negative, as typically estimated from stock return data. Our estimates of the joint process for stock returns and precision (or volatility) using U.S. data confirm this finding. But we also find that stock return volatility does not appear to be variable and persistent enough to generate large intertemporal hedging demands.

There is strong empirical evidence that the conditional variance of asset returns, particularly stock market returns, is not constant over time. Bollerslev, Chou, and Kroner (1992), Campbell, Lo, and MacKinlay (1997, Chapter 12), Campbell et al. (2001) and others review the main findings of the ample econometric research on stock return volatility: Stock return volatility is serially correlated, and shocks to volatility are negatively correlated with unexpected stock returns. Changes in volatility are persistent [French, Schwert, and Stambaugh (1987), Campbell and Hentschel (1992)]. Large negative stock returns tend to be associated with increases in volatility that persist over long periods of time. Stock return volatility appears to be correlated across markets over the world [(Engle, Itc and Lin (1990), Ang and Bekaert (2002)].

---

We thank John Campbell, Pascal Maenhout, Robert Merton, Rachel Pownall, Enrique Sentana, Raman Uppal, seminar participants at HBS, CEMFI, the NBER, and especially an anonymous referee and the editor (John Heaton) for helpful comments and suggestions.

$\circledcirc$ The Author 2005. Published by Oxford University Press. All rights reserved. For Permissions, please email: journals.permissions@oupjournals.org doi:10.1093/rfs/hhi035 Advance Access publication August 31, 2005

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:1 -->

While there is an abundant literature exploring the pricing of assets when volatility is time varying, there is not much research exploring optimal dynamic portfolio choice with volatility risk. This situation is unfortunate, because Samuelson (1969) and Merton (1969, 1971, 1973) have shown that time variation in investment opportunities imply optimal portfolio strategies for multi period investors that can be different from those of single-period, or myopic, investors. Multi period investors value assets not only for their short-term risk-return characteristics, but also for their ability to hedge consumption against adverse shifts in future investment opportunities. Thus these investors have an extra demand for risky assets that reflects intertemporal hedging. 

<!-- Page:2 -->

estimates of the process for stock returns and volatility based on monthly returns from 1926 to 2000 and annual returns from 1871 to 2000.

Our solution contributes to recent research that has expanded significantly the set of known exact analytical solutions to continuous-time intertemporal portfolio-choice problems with time-varying investment opportunities. This research has provided solutions in settings where markets are incomplete, but constraining utility to be defined over terminal wealth (Kim and Omberg, 1996; Wachter, 2002); and in settings where investors have utility over intermediate consumption, but constraining markets to be complete (Brennan and Xia, 2001; Wachter, 2002, Schroder and Skiadas, 1999; and Fisher and Gilles, 1999). This article provides an exact solution for the case of utility defined over intermediate consumption which does not require assuming that markets are complete.

This exact solution requires though that investors have unit elasticity of intertemporal substitution of consumption. This assumption is difficult to justify on empirical grounds, because the existing estimates of this elasticity from aggregate and disaggregate data are well below one [Hall (1988), Campbell and Mankiw (1989), Campbell (1999), Vissin-Jorgensen (2002)]. However, our calibration exercise suggests that this assumption is not particularly constraining if one is interested only in dynamic portfolio choice. This exercise shows that optimal portfolio allocations are very similar across a wide range of values for the elasticity of intertemporal substitution of consumption. Working in discrete time, Campbell and Viceira (1999, 2001, 2002) and Campbell, Chan, and Viceira (2003) also reach similar conclusions in their analysis of optimal consumption and portfolio choice with time variation in expected returns and interest rates.$^{3}$

In a papers closely related to ours, Liu (2002) examines the optimal allocation to stocks when stock return volatility is stochastic.$^{4}$ The paper provides exact analytical solutions in an incomplete markets setting for investors with power utility defined over terminal wealth, and specifications of stochastic volatility which are slightly different from the ones in this article. Liu (2002) considers the Heston (1993) and Stein and Stein (1991) models of stochastic volatility, in which volatility follows a mean-reverting process and stock returns are a linear function of volatility. These models imply a Sharpe ratio of stocks that is increasing in the square root of volatility, and a ratio between expected stock excess returns and stock return volatility—the mean-variance allocation to stocks—that is constant. Our model where we assume that expected

---

3 Their analytical solutions are also exact for investors with unit elasticity of intertemporal substitution of consumption, up to a discrete-time approximation to the log return on wealth.

4 Lynch and Balduzzi (2000) have also addressed tangentially the implications of time-varying volatility for portfolio choice in their study of optimal portfolio rebalancing with stock return predictability and transaction costs. They find that allowing for return heteroskedasticity can have important effects on the optimal portfolio-rebalancing behavior of long-horizon investors.

<!-- Page:3 -->

stock returns are an affine function of volatility have similar implications for the Sharpe ratio and the mean-variance allocation to stocks in the special case where we constrain the intercept of the affine function to be zero. Liu (2002) also considers a model that includes both interest rate risk and volatility risk. A calibration of this model to U.S. data arrives at conclusions similar to ours regarding the relatively modest size of intertemporal hedging demands generated by volatility risk. Finally, Liu (2002) also considers a general class of stochastic volatility models that nests our basic specification with constant expected returns.

The article is organized as follows. Section 2 states the dynamic optimization problem, Section 3 presents an exact solution to the problem in the case with unit elasticity of intertemporal substitution. Section 3 also presents some comparative statics results. Section 4 explains the continuoustime approximate solution method that allows us to solve the problem when the elasticity of intertemporal substitution differs from unity and states the solution implied by the method. Section 5 explores the solution to the problem when expected excess returns are an affine function of volatility. Section 6 calibrates the model to monthly U.S. stock market data and explores the empirical implications of stochastic volatility for portfolio choice. Section 7 discusses some alternative approximate solution and issues related to the accuracy of the approximate analytical solution. Finally, Section8concludes.

## 1. The Intertemporal Consumption and Portfolio Choice Problem

### 1.1 Investment opportunity set

We assume that wealth consists of only tradable assets. Moreover, to keep the analysis simple, we assume that there are only two assets. One of the assets is riskless, with instantaneous return

$$
\frac{dB_t}{B_t} = rdt
$$

The second asset is risky, with instantaneous total return dynamics givenby

$$
\frac{dS_t}{S_t} = \mu dt + \sqrt{\frac{1}{y_t}} dW_s, \tag{1}
$$

where $S_{t}$ is the value of a fund fully invested in the asset that reinvests all dividends, and $y_{t}$ is the instantaneous precision of the risky asset return process--and $1/y_{t}$ is the instantaneous variance.

---

1372

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:4 -->

Equation (1) implies that the expected excess return on the risky asset over the riskless asset $(\upmu\textrm{--}r)$ dt is constant over time-we relax this assumption in Section 4. However, the conditional precision of the risky asset return varies stochastically over time, and this induces time variation in investment opportunities. We assume the following dynamics for instantaneous precision:

$$
dy_t = \kappa(\theta - y_t)dt + \sigma\sqrt{y_t}dW_y.
$$

Precision follows a mean-reverting, square-root process with reversion parameter $\kappa>0$, with $\mathbf{E}[y_{t}]=\theta$ and $\bar{\mathrm{Var}(y_{t})}=\sigma^{2}\theta/\bar{2}\kappa$ (Cox, Ingersoll, and Ross, 1985). In order to satisfy standard integrability conditions, we assume that $2\kappa\theta>\sigma^{2}$

The stochastic process for precision implies a mean-reverting process for the instantaneous volatility $\upsilon_{t}\equiv1/y_{t}$ Applying Ito's Lemma to Equation (2), we find that proportional changes in volatility follow a mean-reverting, square-root process:

$$
\frac{dv_t}{v_t} = \kappa_v (\theta_v - v_t) \, dt - \sigma \sqrt{v_t} dW_y, \tag{3}
$$

where $\theta_{v}=\left(\theta-\sigma^{2}/\kappa\right)^{-1}$ and $\kappa_{\nu}=\kappa\big(\theta-\sigma^{2}/\kappa\big)\equiv\kappa/\theta_{v}$ . It is convenient to note here that the unconditional mean of instantaneous volatility is approximately equal to:

$$
\mathrm{E}[v_t] \approx \frac{1}{\theta} + \frac{1}{2} \frac{\sigma^2}{\theta^2 \kappa} = \frac{1}{\theta} + \frac{\mathrm{Var}(y_t)}{\theta^3}. \tag{4}
$$

This follows from taking expectations of a second-order Taylor expansionof $\upsilon_{t}\equiv1/y_{t}$ around $\theta$ . Since we have assumed that the expected return on the risky asset is constant, Equation (4) is also the unconditional variance of the risky asset return.

We also assume throughout the article that the shocks to precision are correlated with the instantaneous return on the risky asset, with $d W_{y}$ $d W_{s}=\rho d t$ . This in turn implies that proportional changes in volatility are correlated with stock returns, with instantaneous correlation given by

$$
\operatorname{Corr}_t\left(\frac{dv_t}{v_t},\frac{dS_t}{S_t}\right) = -\operatorname{Corr}_t\left(dy_t,\frac{dS_t}{S_t}\right) = -\rho dt.
$$

---

5 We have performed a Monte Carlo experiment to corroborate this assertion and the quality of the approximation[Equation(4)].Using themonthly parameter estimates of this process shown inTable 1, we have generated 10000 time series of the process (1)(2), each 30years in length, with a time stp $d t=0.01$ (or about three days).This experiment shows that the unconditional variance of stock returns is indeed given by the unconditional mean of volatility, and that the approximation [Equation (4)] is fairly precise--in our experiment,it underestimates the true variance by $0.27\%$

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:5 -->

This model for stock returns and precision or volatility can capture the main stylized empirical facts about stock return volatility, in particular its mean reversion and negative correlation with stock returns. It also implies that proportional changes in volatility are more pronounced in times of high volatility than in times of low volatility.

Another important implication of this model of changing risk is that the ratio of the expected excess return on the risky asset to its variance is a linear function of the state variable. This model assumption greatly facilitates solving the dynamic optimization problem that we present below. It is important, however, to remark that the Sharpe ratio of the risky asset in this model is not a linear function of the state variable, but a square-root function. Thus, this model is not mathematically equivalent to a model where volatility is constant and the expected excess return on the risky asset changes stochastically in a mean-reverting fashion, as in Kim and Omberg (1996) or Campbell and Viceira (1999).

### 1.2 Investor preferences and dynamic optimization problem

Investor's preferences are described by a recursive utility function, a generalization of the standard, time-separable power utility model that separates relative risk aversion from the elasticity of intertemporal substitution of consumption. Epstein and Zin (1989, 1991) derive a parameterization of recursive utility in a discrete-time setting, while Duffie and Epstein (1992a, 1992b) and Fisher and Gilles (1999) offer a continuous-time analogue. We adopt the Duffie and Epstein (1992b) parameterization:

$$
J = \mathrm{E}_t \left[ \int_{t}^{\infty} f(C_s, J_s) \, ds \right], \tag{5}
$$

where $\mathrm{f}(C_{s},J_{s})$ is a normalized aggregator of current consumption and continuation utility that takes the form

$$
f(C, J) = \frac{\beta}{1 - \frac{1}{\psi}} (1 - \gamma) J \left[ \left( \frac{C}{((1 - \gamma) J)^{\frac{1}{1 - \gamma}}} \right)^{1 - \frac{1}{\psi}} - 1 \right], \tag{6}
$$

$\beta>0$ is the rate of time preference, $\gamma>0$ is the coefficient of relative risk aversion and $\psi>0$ is the elasticity of intertemporal substitution. Power utility obtains from (6) by setting $\psi=1/\gamma$

The normalized aggregator $\mathrm{f}(C_{s},J_{s})$ takes the following form when $\psi\to1$

$$
f(C, J) = \beta(1 - \gamma) J \left[ \log (C) - \frac{1}{1 - \gamma} \log ((1 - \gamma) J) \right]. \tag{7}
$$

The investor maximizes Equation (5) subject to the intertemporal budget constraint

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:6 -->

$$
dX_t=\left[\pi_t(\mu-r)X_t+rX_t-C_t\right]dt+\pi_t\sqrt{\frac{1}{y_t}}dW_s, \tag{8}
$$

where $X_{t}$ represents the investor's wealth, $\pi_{t}$ the fraction of wealth invested in the risky asset and $C_{t}$ the investor's instantaneous consumption. 

## 2. An Exact Solution with Unit Elasticity of Intertemporal Substitution of Consumption

Building on the work of Merton (1969, 1971, 1973), Giovannini and Weil (1989), Campbell and Viceira (1999, 2001), and Campbell, Chan, and Viceira (2003), we show in this section that it is possible to find an exact solution to the intertemporal optimization problem [Equations (5)-(8)] when investors have unit elasticity of intertemporal substitution of consumption. In Section 3, we present an approximate analytic solution for the general case in which $\psi$ is not restricted to one. 

The optimization problem given by Equations (5)-(8) has one state variable, the precision of the risky asset return or, equivalently, the volatility of the risky asset return. Therefore, the value function of the problem $(J)$ depends on financial wealth $(X_{t})$ and this state variable. 

The Bellman equation for this problem is

$$
0 = \sup_{\pi, C} \left\{ f(C_s, J_s) + \left[\pi_t(\mu - r)X_t + rX_t - C_t\right]J_X + \frac{1}{2}\pi^2X_t^2J_{XX}\frac{1}{y_t} + \kappa(\theta - y_t)J_y + \frac{1}{2}\sigma^2J_{yy,y_t} + \rho\sigma\pi_tX_tJ_{Xy} \right\}, \tag{9}
$$

where $f(C,J)$ is given in Equation (7) and subscripts on $J$ denote partial derivatives. 

The first-order conditions for this equation are

$$
C_t = \beta \left(1 - \gamma\right) \frac{J}{J_X}, \tag{10}
$$

$$
\pi_t = -\frac{J_X}{X_t J_{XX}} (\mu - r) y_t - \frac{J_{Xy}}{X_t J_{XX}} \rho \sigma y_t. \tag{11}
$$

Equation (10) shows the optimal consumption rule. It results from the envelope condition, $\mathbf{f}_{C}=J_{X},$ from which the optimal consumption rule obtains once the value function is known. 

Equation (11) shows the optimal portfolio share in the risky asset. Note, however, that Equations (10) and (11) do not represent a complete solution to the model until we solve for $J(\boldsymbol{{X}}_{t},\boldsymbol{{y}}_{t})$ . Proposition 1 states the complete solution to this problem:

<!-- Page:7 -->

Proposition 1. When $\psi{=}1$ . there is an exact analytical solution to problem (5)-(8) with value function given by

$$
J(X_t, y_t) = \exp \left\{ A y_t + B \right\} \frac{X_t^{1-\gamma}}{1-\gamma}. \tag{12}
$$

This value function implies the following optimal consumption and portfolio rules:

$$
\frac{C_t}{X_t} = \beta \tag{13}
$$

and

$$
\pi_t = \frac{1}{\gamma} (\mu - r) y_t + \left(1 - \frac{1}{\gamma}\right)(-\rho) \sigma \mathcal{A} y_t, \tag{14}
$$

where $\mathcal{A}\equiv A/(1-\gamma)>0,$ and $A$ and $B$ are given by the solution to the system of Equations (26)-(27).

Proof. Appendix A examines the value function and its coefficients. The optimal policies follow immediately from direct substitution of the value function (12) and its derivatives into the first order conditions (10) and (11).

Proposition 1 shows that for investors with unit elasticity of intertemporal substitution, the optimal log consumption-wealth ratio is invariant to changes in volatility and it is equal to their rate of time preference. For these investors, the income and substitution effects on consumption produced by a change in the investment opportunity set exactly cancel out, and it is optimal for them to consume a fixed fraction of their wealth each period. For this reason, this consumption policy is usually termed “myopic."

Equation (14) shows the optimal portfolio rule. This rule has two components. The first component is myopic (or mean-variance) portfolio demand. The second component is Merton's intertemporal hedging demand. Both components are linear functions of precision, which implies that their ratio is independent of the current level of precision or volatility. This is the result of returns being instantaneously correlated with proportional changes in volatility rather than with absolute changes in volatility.

Inspection of Equation (14) shows that intertemporal hedging demand is always zero—and myopic demand optimal—in three cases: when investment opportunities are constant $(\sigma=0)$; when they are time-varying, but investors cannot use the risky asset to hedge changes in investment

---

1376

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:8 -->



<!-- Page:9 -->

approximate analytical solution to the problem. This solution provides strong economic intuition about the nature of optimal portfolio choice with time-varying risk and converges to an exact solution in those special cases where such a solution is known. We argue in Section 5.3 that, for all other cases, it is reasonably accurate.

### 3.1 Bellman equation and approximation

When $\psi$ is not restricted to one, the Bellman equation for the problem is still given by Equation (9). The first-order condition for portfolio choice is still given by Equation (1l), but the first-order condition for consumption resulting from the envelope condition $\operatorname{f}_{C}=\operatorname{J}_{X}$ is different, because the aggregator takes a different form, given in Equation (6). The first-order condition for consumption is now given by:

$$
C_t = J_X^{-\psi} [(1 - \gamma) J]^{\frac{1 - \psi}{1 - \gamma}} \beta^\psi. \tag{15}
$$

After plugging Equations (11) and (15) into the Bellman equation (9), guessing that $J(\overset{\cdot}{X}_{t},\overset{\cdot}{y_{t}})=I(y_{t})\overset{\cdot}{X_{t}^{1-\gamma}}/(1-\gamma)$, and making the transformation $I=H^{-\frac{1-\gamma}{1-\psi}}$ we obtain the following non-homogeneous ordinary differential equation (ODE):

$$
0 = -\beta^\psi H^{-1} + \psi \beta + \frac{(1 - \psi)(\mu - r)^2}{2\gamma} y_t - \frac{\rho \sigma (\mu - r)(1 - \gamma)}{\gamma} \frac{H_y}{H} y_t \\ + r(1 - \psi) + \frac{\rho^2 \sigma^2 (1 - \gamma)^2}{2\gamma (1 - \psi)} \left(\frac{H_y}{H}\right)^2 y_t - \frac{H_y}{H} \kappa (\theta - y_t) \\ + \frac{\sigma^2}{2} \left(\frac{1 - \gamma}{1 - \psi} + 1\right) \left(\frac{H_y}{H}\right)^2 y_t + \frac{\sigma^2}{2} \frac{H_{yy}}{H} y_t. \tag{16}
$$

Unfortunately, Equation (16) is a non-linear ODE in $H$ whose analytical solution is unknown except in three special cases. The first two cases are well known from Merton's (1969, 1971, 1973) work and correspond to log utility $(\gamma=\psi\equiv1$) and constant investment opportunities $(\kappa,\sigma=0)$

The third case corresponds to power utility and perfect instantaneous correlation of the state variable with the risky asset return—-so that markets are complete.$^6$ This case has also been explored by Wachter (2002) and Liu (2002). Unfortunately, the assumption of perfect correlation between changes in volatility and asset returns is not empirically plausible. For example, in Section 6 we estimate that for the U.S. market this correlation is large, but still far from perfect. This suggests that we should consider the general case.

---

6With $|\rho|=1$ , Equation (16) becomes a non-homogeneous version of the Gauss hypergeometric ODE, which has a closed-form solution in terms of the confluent hypergeometric function (Polyanin and Zaitsev 1995,p.143). Unfortunately, this solution has a rather abstruse mathematical form,from which it isvery difficult to obtain anyuseful economic insights.

1378

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:10 -->

In the general case, it is still possible to find an approximate analytic solution to the non-linear ODE [Equation (16)], based on a log-linear expansion of the consumption-wealth ratio around its unconditional mean. Campbell (1993), Campbell and Viceira (1999, 2001), and Campbell, Chan, and Viceira (2003) have used an identical approximation to solve for optimal intertemporal portfolio and consumption problems. However, while they work in discrete time and use the approximation to linearize the log budget constraint, we work here in continuous time and use it to linearize the Bellman equation. We can view this approach as a particular class of the perturbation methods of approximation described in Judd (1998), where the approximation takes place around a particular point in the state space -the unconditional mean of the log consumption-- wealthratio.

We start by noting that the envelope condition (15) implies

$$
\vartheta^\psi H^{-1} = \exp \{ c_t - x_i \}
$$

where $c_{t}-x_{t}=\log(C_{t}/X_{t})$. Therefore, using a first-order Taylor expansion of $\exp\{c_{t}-x_{t}\}$ around $E[c_{t}-x_{t}]\equiv(\overline{{c-x}})$, we can write

$$
\beta^{\psi} H^{-1} \approx h_{0} + h_{1} (c_{t} - x_{t}), \tag{17}
$$

where $h_{1}=\exp\{\overline{{c-x}}\}$, and $h_{0}=h_{1}\big(1-\log h_{1}\big)$

Substituting Equation (17) for $\beta^{\psi}H^{-1}$ in the first term of Equation (16), it is easy to see that the resulting ODE has a solution of the form $H=\exp\{A_{1}y_{t}+B_{1}\}$. This solution implies a value function of the form

$$
J\left(X_t, y_t\right) = \exp \left\{-\left(\frac{1-\gamma}{1-\psi}\right)(A_1y_t + B_1)\right\} \frac{X_t^{1-\gamma}}{1-\gamma}, \tag{18}
$$

where $A_{1}$ and $B_{1}$ solve a system of two equations given in Appendix A.

### 3.2 Optimal policies

We now state the approximate solution in the following proposition:

Proposition 2. When $\psi\neq1$, there is an approximate analytical solution to problem $(5){-}(8)$ with value function given by Equation (18). The optimal consumption and portfolio rules implied by this value function are

$$
\frac{C_{t}}{X_{t}} = \beta^{\psi} \exp \left\{ -A_1 y_t - B_1 \right\}, \tag{19}
$$

and

$$
\pi_t = \frac{1}{\gamma} (\mu - r) y_t + \left(1 - \frac{1}{\gamma}\right) (-\rho) \sigma \mathcal{A}_1 y_t, \tag{20}
$$

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1379

<!-- Page:11 -->

where $\mathcal{A}_{1}\equiv-A_{1}/(1-\psi)>0$ and $A_{1}$ and $B_{1}$ are given by the solution to the system of equations (32)-(33). $\mathcal{A}_{1}$ does not depend on $\psi$ except through the loglinearization coefficient $h_{1}$ and it reduces to $\mathcal{A}$ in Proposition $I$ when $h_{1}=\beta$

Proof. See Appendix A.

The approximate solution depends on the loglinearization coefficient $h_{1}$ which is itself endogenous. However, Proposition 2 shows that we can still derive many properties of the solution without solving explicitly for $h_{1}$ using the fact that it lies between zero and one. We now comment on some of these properties, and leave for Section 5 the description of a simple procedure to compute numerical values for $h_{1}$ and the optimal policies.

Proposition 2 shows that the optimal log consumption-wealth ratio is an affine function of instantaneous precision. Since $A_{1}/(1-\psi)<0$ ,the consumption-wealth ratio is a decreasing monotonic function of volatility for investors whose intertemporal elasticity of consumption $\psi$ is smaller than one, while it is an increasing function of volatility for investors whose elasticity is larger than one.

This property reflects the comparative importance of intertemporal income and substitution effects of volatility on consumption. To understand this, consider the effect on consumption of an unexpected increase in volatility. This increase implies a deterioration in investment opportunities, because returns on the risky asset are now more volatile, while its expected return is the same.

A deterioration in investment opportunities creates a positive intertemporal substitution effect on consumption—because the investment opportunities available are not as good as they are at other times—but also a negative income effect—because increased uncertainty increases the marginal utility of consumption. For investors with $\psi<1$ ,the income effect dominates the substitution effect and they reduce their current consumption relative to wealth. For investors with $\psi>1$ ,the substitution effect dominates, and they increase their current consumption relative to wealth.

Proposition 2 also characterizes optimal portfolio demand in the general case. This proposition implies that optimal portfolio demand in the $\psi\neq1$ case is qualitatively analogous to optimal portfolio demand in the $\psi=1$ case. This follows immediately from direct comparison of Equations (20) and (14). These equations are identical, except for the positive coefficients ${\mathcal{A}}_{1}$ and $\boldsymbol{\mathcal{A}}$. Section 6 shows that, for empirically plausible characterizations of the process for precision, these coefficients are very close, which implies that the effect of $\psi$ on optimal portfolio choice is quantitatively small. Campbell and Viceira (1999, 2001) and Campbell, Chan, and Viceira (2003) show a similar result in models with time variation in risk premia and interest rates.

---

1380

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:12 -->

Finally, we want to note that an important feature of the approximate solution is that it delivers the exact expression for the optimal policies in the special cases of log utility $\mathbf{\Psi}(\gamma=\psi\equiv1)$, unit elasticity of intertemporal substitution, and constant investment opportunities $(\kappa,\sigma=0$ and $v_{t}\equiv v$). Appendix A shows this convergence result.

## 4. Consumption and Portfolio Choice When Expected Excess Returns Covary with Volatility

The analysis of optimal consumption and portfolio choice with time-varying risk in Sections 3 and 4 assumes that expected excess returns are constant. A natural extension of this analysis is to replace the assumption of constant expected excess returns with one that allows expected excess returns to vary with volatility:

$$
\mathrm{E}_{t}\left[\frac{dS_{t}}{S_{t}}-rdt\right] = (\alpha_{1} + \alpha_{2}v_{t}) \, dt = (\alpha_{t} + \alpha_{2}y_{t}^{-1}) \, dt. \tag{21}
$$

When ${\alpha_{2}}>0$, Equation (21) implies increases in risk are rewarded with increases in expected excess returns. This model also nests the model in Section 2, which obtains when $\alpha_{2}=0$ and $\alpha_{1}=\mu-r$.

To derive the optimal policies under this new assumption we follow the same method as in Section 3. We describe here the solution, and leave for Appendix B a detailed analysis of its derivation. The approximate solution implies a value function of the form

$$
J(X_t, y_t) = \exp \left\{ -\left(\frac{1-\gamma}{1-\psi}\right)(A_1 y_t + A_2 \log y_t + B_2) \right\} \frac{X_t^{1-\gamma}}{1-\gamma},
$$

where $A_{1}$ and $A_{2}$ solve two independent quadratic equations and $B_{2}$ solves an equation which is linear, given $A_{1}$ and $A_{2}$.

Proposition 3 shows the optimal consumption and portfolio rules implied by this value function:

Proposition 3. The optimal consumption and portfolio rules when $\mathrm{E}_{t}[(d S_{t}/S_{t})-r d t]{=}(\alpha_{1}+\alpha_{2}v_{t})d t{=}(\alpha_{1}+\alpha_{2}/y_{t})d t$ are

$$
\frac{C_t}{X_t} = \beta^{\psi} \exp \left\{ -A_1 y_t - A_2 \log y_t - B_2 \right\}, \tag{22}
$$

and

$$
\pi_t = \frac{1}{\gamma} (\alpha_1 y_t + \alpha_2) + \left(1 - \frac{1}{\gamma}\right) (-\rho) \sigma (\mathcal{A}_1 y_t + \mathcal{A}_2). \tag{23}
$$

where $\mathcal{A}_{1}\equiv-A_{1}/(1-\psi)>0$ and $\mathcal{A}_{2}\equiv-A_{2}/(1-\psi)<0$. $\mathcal{A}_{1}$ and $A_{2}$ do not depend on $\psi$, except through the loglinearization constant $h_{1}$.

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1381

<!-- Page:13 -->

$\mathcal{A}_{1}$ is mathematically identical to $\mathcal{A}_{1}$ in Proposition 2, with $\alpha_{1}=\mu-r$ Thus it does not depend on $\alpha_{2}$ .except through $h_{1}$ $\mathcal{A}_{2}$ does not depend on $\alpha_{1}$

Proof. See appendix B. 1

Proposition 3 shows that the myopic component and the intertemporal hedging component of portfolio demand are both affine functions of precision—not simply proportional to precision, as in the case with constant expected returns. Thus total portfolio demand is itself an affine function of precision. The slope of total portfolio demand is mathematically identical to the optimal portfolio rule in the case with constant expected returns—with $\alpha_{1}$ replacing $\mu-r$ .It captures essentially the effect on portfolio choice of changes in volatility that are not rewarded by corresponding changes in expected excess returns.

The intercept of the optimal portfolio rule captures the additional effects caused by the fact that now a unit shift in volatility changes expected excess returns by $\alpha_{2}$ units. The magnitude of the intercept depends on $\alpha_{2}$ , but its sign is independent of the sign of $\alpha_{2}$ . To gain some intuition on why the sign of $\alpha_{2}$ is irrelevant for intertemporal hedging, consider myopic portfolio demand when $\alpha_{1}~=~0$ . In that case, the myopic portfolio is long in stocks when $\alpha_{2}>0$ ,and short when ${\alpha_{2}}\mathrm{~<~0~}$ ,and it has a Sharpe ratio equal to $\lvert\alpha_{2}\rvert\sqrt{v_{t}}$ Thus negative shocks to volatility always drive the Sharpe ratio on the myopic portfolio downwards regardless of their impact on expected excess returns; they represent a worsening in investment opportunities. Equation (23) with $\alpha_{1}=0$ shows that whether this leads to a positive or a negative intertemporal hedging demand for shocks depends on the sign of the instantaneous correlation between returns and shocks to volatility $(-\rho)$ and $(1-1/\gamma)$ . In particular, when $-\rho<0$ and so return is low when volatility is high, an investor with $\gamma>1$ will have a positive intertemporal hedging demand for the risky asset, because it tends to pay when investment opportunities worsen and the marginal utility of consumption is high.

## 5. Optimal Consumption and Portfolio Choice with Stochastic Volatility: The U.S. Experience

### 5.1 Parameter values

This section examines the implications for optimal portfolio choice and consumption of the patterns in volatility observed in the U.S. stock market. Table 1 reports parameter estimates of the process (1)-(2) and their standard errors. We estimate the model using the Spectral Generalized Method of Moments (SGMM) of Chacko and Viceira (2003), Jiang and Knight

---

1382

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:14 -->

<center><i>Table 1 reports estimates of the stochastic process driving stock returns and volatility using Spectral GMM. The monthly estimates are based on excess stock returns on the CRSP value-weighted portfolio over the T-bill rate from January 1926 through December 2000. The annual estimates are based on excess equity returns on the Standard and Poor Composite Stock Price Index over the prime commercial paper rate from 1871 through 2000. The annual dataset is an updated version of Shiller's (1989) long-run data, publicly available at his website [http://www.econ.yale.edu/shiller/]. Standard errors are bootstrapped, and parameter estimates are annualized to facilitate their interpretation.</i></center>

| Model                                                                 | Parameter estimates (s.e.) | 1926.01–2000.12 | 1871–2000 |
|-----------------------------------------------------------------------|---------------------------|-----------------|-----------|
| $dS_t/S_t - dB_t/B_t = (\mu - r) dt + \sqrt{y_t} dW_s$,               | $\mu - r$                 | .0811           | .0848     |
| $y_t = 1/y_t$                                                         |                           | (.0235)         | (.0369)   |
| $dy_t = \kappa(\theta - y_t) dt + \sigma \sqrt{y_t} dW_y$,            | $\kappa$                  | .3374           | .0438     |
| $dW_s dW_y = \rho dt$                                                 |                           | (.3025)         | (.0443)   |
|                                                                       | $\theta$                  | 27.9345         | 25.2109   |
|                                                                       |                           | (1.7961)        | (12.5738) |
|                                                                       | $\sigma$                  | .6503           | 1.1703    |
|                                                                       |                           | (.4802)         | (.6892)   |
|                                                                       | $\rho$                    | .5241           | .3688     |
|                                                                       |                           | (.2274)         | (.3665)   |

We provide two sets of parameter estimates. The first set is based on monthly excess stock returns on the CRSP value-weighted portfolio over the T-bill rate from January 1926 through December 2000. The second set is based on annual excess equity returns on the Standard and Poor Composite Stock Price Index over the prime commercial paper rate from 1871 through 2000. This is an updated version of Shiller's (1989) dataset. In both datasets, stock returns are inclusive of dividends. In our calibration exercises, we set the riskless rate at $1.5\%$ per year.

The estimates of both the unconditional mean of excess returns and precision have low standard errors in both samples. However, the estimates of the rest of the parameters—-particularly the reversion parameter—are less precise. These estimates imply a mean excess return around $8\%$ per year in both samples and, using the approximate expression of the

---

[^7]: SGMM is essentially GMM estimation based on the complex moments generated by the characteristic function of the process. Unlike other methods such as the Efficient Method of Moments (EMM), SGMM does not require discretization of the parameter space, and it is simple to apply in practice. SGMM estimates are less efficient than EMM estimates, but Chacko and Viceira (2003) note that SGMM estimates and EMM estimates of stochastic volatility models are otherwise very similar. Note that direct estimation via maximum likelihood (Lo, 1988) is not feasible here, because the likelihood function of this process is not known analytically. Full details of the estimation are readily available from the authors upon request.

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:15 -->

unconditional variance of stock returns given in Equation (4), an unconditional standard deviation of returns of almost $20\%$ per year in the monthly sample, and about $25\%$ per year in the annual sample. The instantaneous correlation between shocks to volatility and stock returns $(-\rho)$ is negative and relatively large--about $53\%$ in the monthly sample and about $37\%$ in the annual sample.

The estimate of the reversion parameter $\kappa$ in the precision equation implies a half-life of a shock to precision of about two years in the monthly sample. The rate of mean reversion is slower in the annual sample, where the estimate of the half-life of a shock to precision is about 16 years. French, Schwert, and Stambaugh (1987), Schwert (1989), and Campbell and Hentschel (1992) have also found a relatively slow speed of adjustment of shocks to stock volatility in low-frequency data. This slow reversion to the mean in low-frequency data contrasts with the fast speed of adjustment detected in high-frequency data by Andersen, Benzoni, and Lund (1998).

These results suggest that there might be high-frequency and lowfrequency (or long-memory) components in stock market volatility (Chacko and Viceira, 2003). By construction, the single-component model (1)-(2) cannot capture these components simultaneously. On the other hand, it is very difficult to find analytical solutions for a model with multiple components in volatility. We hope that by focusing on estimates of the single-component model derived from low-frequency data, we can capture the persistence andvariabilitycharacteristics of the volatility process that are most relevant to long-term investors. Accordingly, in our calibration exercise we focus on the monthly and annual estimates of the single-component model.

### 5.2 Calibration results

The optimal portfolio choice and consumption rules given in Equation (19) and (20) depend on the log-linearization coefficient $h_{1}$ which is itself endogenous. To evaluate these expressions numerically, we use a simple recursive procedure. We take an initial value of $h_{1}$ ,solve for the corresponding optimal consumption-wealth ratio (19), and use this consumptionwealth ratio to calculate a new value for $h_{1}$ .We repeat this procedure until convergence. In practice, convergence is extremely fast.

Table 2 explores the implications for portfolio choice of the monthly estimates, while Table 3 explores the implications of the annual estimates. We consider investors with coefficients of relative risk aversion $(\gamma)$ inthe interval [0.75, 40], elasticities of intertemporal substitution $(\psi)$ in the interval [1/0.75, 1/40], and a rate of time preference $(\beta)$ equal to $6\%$ annually.

---

8For the anual estimates, the loglinearization parameter $h_{1}$ converges to zero for investors with $\gamma=$ $1/\psi=0.75$ and $\beta=6\%$ Weuse instead $\gamma=1/\bar{\psi}=0.8$ and $\beta=6\%$ ,for which the procedure converges.

1384

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:16 -->

<center><i>Table2 Mean optimal percentage allocationto stocks and percentage hedging demand over myopic demand (Sample:1926.01-2000.12) </i></center>

| R.R.A. | 1/0.75  | 1.00   | 1/1.5  | 1/2    | 1/4    | 1/10   | 1/20   | 1/40   |
|--------|---------|--------|--------|--------|--------|--------|--------|--------|
|        |         |        |        |        |        |        |        |        |
| A. Mean optimal allocation to stocks (%): $E[\pi_{t}(y_{t})] = \pi(\theta) \times 100$ | | | | | | | | |
| 0.75   | 305.92  | 305.66 | 305.42 | 305.32 | 305.17 | 305.09 | 305.07 | 305.05 |
| 1.00   | 226.55  | 226.55 | 226.55 | 226.55 | 226.55 | 226.55 | 226.55 | 226.55 |
| 1.50   | 149.30  | 149.32 | 149.34 | 149.35 | 149.37 | 149.38 | 149.38 | 149.38 |
| 2.00   | 111.38  | 111.37 | 111.37 | 111.37 | 111.37 | 111.37 | 111.37 | 111.37 |
| 4.00   | 55.26   | 55.24  | 55.21  | 55.20  | 55.18  | 55.16  | 55.16  | 55.16  |
| 10.0   | 22.01   | 21.99  | 21.97  | 21.96  | 21.94  | 21.93  | 21.93  | 21.93  |
| 20.0   | 10.99   | 10.98  | 10.97  | 10.96  | 10.95  | 10.94  | 10.94  | 10.94  |
| 40.0   | 5.49    | 5.48   | 5.48   | 5.47   | 5.47   | 5.47   | 5.47   | 5.46   |
|        |         |        |        |        |        |        |        |        |
| B. Ratio of hedging demand over myopic demand (%) | | | | | | | | |
| 0.75   | 1.28    | 1.19   | 1.11   | 1.08   | 1.03   | 1.00   | 0.99   | 0.99   |
| 1.00   | 0.00    | 0.00   | 0.00   | 0.00   | 0.00   | 0.00   | 0.00   | 0.00   |
| 1.50   | -1.15   | -1.13  | -1.12  | -1.11  | -1.10  | -1.10  | -1.09  | -1.09  |
| 2.00   | -1.68   | -1.68  | -1.68  | -1.68  | -1.68  | -1.68  | -1.68  | -1.68  |
| 4.00   | -2.43   | -2.47  | -2.52  | -2.54  | -2.58  | -2.60  | -2.61  | -2.61  |
| 10.0   | -2.86   | -2.94  | -3.02  | -3.07  | -3.14  | -3.18  | -3.20  | -3.21  |
| 20.0   | -3.00   | -3.09  | -3.19  | -3.25  | -3.33  | -3.38  | -3.40  | -3.41  |
| 40.0   | -3.06   | -3.17  | -3.28  | -3.33  | -3.42  | -3.48  | -3.50  | -3.51  |

Panel A reports mean optimal percentage allocations to stocks for different coefficients of relative risk aversion and elasticities of intertemporal subsitution of consumption. Panel B reports the percentage ratio of intertemporal hedging portfolio demand over myopic portfolio demand, which is independent of the level of precision or volatility. These numbers are based on the monthly parameter estimates of the joint process for return and volatility reported in Table1.

<center><i>E.1.S.  Table3 Mean optimal percentage allocation to stocks and percentage hedging demand over myopic demand (Sample:1871-2000)  E.I.S. </i></center>

| R.R.A. | 1/0.80 | 1.00 | 1/1.5 | 1/2 | 1/4 | 1/10 | 1/20 | 1/40 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| | | | | | | | | |
| A. Mean optimal allocation to stocks (%): $E[\pi_t(y_t)] = \pi(\theta) \times 100$ | | | | | | | | |
| 0.80 | 289.13 | 281.23 | 277.71 | 276.64 | 275.43 | 274.85 | 274.68 | 274.60 |
| 1.00 | 213.79 | 213.79 | 213.79 | 213.79 | 213.79 | 213.79 | 213.79 | 213.79 |
| 1.50 | 135.34 | 135.42 | 135.54 | 135.60 | 135.69 | 135.74 | 135.76 | 135.77 |
| 2.00 | 99.54 | 99.42 | 99.25 | 99.16 | 99.01 | 98.91 | 98.88 | 98.86 |
| 4.00 | 48.54 | 48.31 | 47.97 | 47.78 | 47.45 | 47.24 | 47.16 | 47.11 |
| 10.0 | 19.16 | 19.03 | 18.82 | 18.71 | 18.51 | 18.38 | 18.34 | 18.31 |
| 20.0 | 9.54 | 9.47 | 9.35 | 9.29 | 9.18 | 9.11 | 9.08 | 9.07 |
| 40.0 | 4.76 | 4.72 | 4.66 | 4.63 | 4.57 | 4.54 | 4.52 | 4.51 |
| | | | | | | | | |
| B. Ratio of hedging demand over myopic demand (%) | | | | | | | | |
| 0.80 | 8.19 | 5.24 | 3.92 | 3.52 | 3.06 | 2.85 | 2.79 | 2.76 |
| 1.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| 1.50 | -5.04 | -4.98 | -4.90 | -4.86 | -4.80 | -4.76 | -4.74 | -4.74 |
| 2.00 | -6.88 | -6.99 | -7.15 | -7.24 | -7.37 | -7.47 | -7.50 | -7.51 |
| 4.00 | -9.19 | -9.61 | -10.25 | -10.60 | -11.22 | -11.62 | -11.77 | -11.85 |
| 10.0 | -10.38 | -11.00 | -11.95 | -12.49 | -13.40 | -14.01 | -14.23 | -14.35 |
| 20.0 | -10.76 | -11.44 | -12.49 | -13.09 | -14.10 | -14.77 | -15.02 | -15.14 |
| 40.0 | -10.94 | -11.66 | -12.76 | -13.38 | -14.44 | -15.14 | -15.40 | -15.53 |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>See note to Table 2. </i>
</div>
</center>

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1385

<!-- Page:17 -->

Panel A of each table reports mean optimal percentage allocations to stocks. It shows that the mean optimal portfolio allocation to stocks varies widely across investors with different coefficients of relative risk aversion but similar elasticity of intertemporal substitution of consumption. By contrast, there is very little variation in the mean optimal portfolio allocations of investors with different elasticities of intertemporal substitutions of consumption but similar coefficient of relative risk aversion. Campbell and Viceira (1999, 2001) and Campbell, Chan, and Viceira (2003) find similar results in models with time-varying expected returns and interest rates.

Panel B evaluates the empirical importance of intertemporal hedging demands resulting from volatility risk. It reports the percentage ratio of hedging portfolio demand over myopic portfolio demand. Equations (14) and (20) show that this ratio is independent of the level of precision or volatility. Consistent with the results in Propositions 1 and 2, the estimated negative instantaneous correlation of volatility with stock returns implies a positive intertemporal hedging demand for investors with $\gamma<1$ and a negative demand for investors with $\gamma>1$

More importantly, Panel B shows that our estimates of volatility risk imply intertemporal hedging demands that are typically small. By contrast, Brandt (1999), Campbell and Viceira (1999, 2001, 2002), Campbell, Chan, and Viceira (2003), and others have shown that the time variation in risk premia or in interest rates estimated from U.s. data imply large intertemporal hedging demands for investors with similar preferences.

There are, however, striking differences across both samples. The monthly estimates generate very small intertemporal hedging demands: Even for highly risk-averse investors $(\gamma=40)$ , hedging demand reduces myopic demand by less than $4\%$ . By contrast, the annual estimates generate much larger intertemporal hedging demands: Hedging demand reduces myopic demand by $4.7\%$ for investors with $\gamma=1.5$ and by almost $16\%$ for investors with $\gamma=40$

Figures 1 through 4 report the results of comparative statics exercises that evaluate the sensitivity of intertemporal hedging demand to changes in the persistence, mean and variance of precision, and in its correlation with stock returns. These are the main dimensions along which the monthly estimates differ from the annual estimates. These figures plot the ratio of hedging demand to myopic demand for investors with $\psi=1/2$ and $\gamma=\{2,4,20\}$ as we consider changes in the parameters of interest and keep the rest of the parameters at the values implied by the monthly estimates.Itispossibletoshowanalyticallythatqualitativelysimilar results hold for general parameter values in the case $\psi=1$

First, we examine in Figure 1 the effect on intertemporal hedging of changes in the persistence of shocks to precision $(\kappa)$ , holding the first and

---

We omit here the results for the case $\psi=1$ to save space. However, they are readily available from the authors upon request.

1386

<!-- Page:18 -->

<center><i>Figure 1: Effect on optimal portfolio demand of compensated changes in the persistence of shocks to precision. This figure plots the ratio of intertemporal hedging demand to myopic demand for investors with <img src="https://latex.codecogs.com/svg.image?\psi=1/2" style="vertical-align: middle; height: 1.2em;" alt="\psi=1/2" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\gamma=\{2,4,20\}" style="vertical-align: middle; height: 1.2em;" alt="\gamma=\{2,4,20\}" class="latex-formula"/> as we consider changes in <img src="https://latex.codecogs.com/svg.image?\kappa" style="vertical-align: middle; height: 1.2em;" alt="\kappa" class="latex-formula"/> that leave the first and second unconditional moments of stock returns and precision constant at the values implied by the monthly estimates shown in Table 1. This figure considers values of <img src="https://latex.codecogs.com/svg.image?\kappa" style="vertical-align: middle; height: 1.2em;" alt="\kappa" class="latex-formula"/> implying half-lives of a shock to precision between 6 months and 30 years. The vertical line intersects the horizontal axis at the value implied by the monthly estimate of <img src="https://latex.codecogs.com/svg.image?\kappa" style="vertical-align: middle; height: 1.2em;" alt="\kappa" class="latex-formula"/></i></center>

<div align="center">
  <img src="images/81aa8f88cf6dcf077972ec6e8d243f7228aff824cf768b40d21420c65f68d3c5.jpg" style="max-width: 70%;" />
</div>

We achieve this by varying $\sigma$ appropriately as we change the persistence parameter $\kappa$. Note that $\mathrm{Var}\left(y_{t}\right)=\sigma^{2}\theta/2\kappa$ and $\mathrm{Var}\left(\frac{d S_{t}}{S_{t}}\right)\approx1/\theta+\mathrm{Var}(\bar{y_{t}})/\theta^{3}$. Thus setting $\sigma^{2}=2\kappa\mathrm{Var}(y_{t})/\theta$ leaves these moments unchanged as we vary $\kappa$. Furthermore, the unconditional mean of precision $(\theta)$ and stock returns $(\mu)$ do not change with either $\kappa$ or $\sigma$.

Interestingly, Figure 1 shows that the absolute magnitude of intertemporal hedging demand does not increase monotonically with compensated increases in persistence. The case $\psi=1$ provides some intuition for this result. When $\psi=1$, the inflection point is $\kappa=\beta$. Thus a compensated increase in persistence increases the size of intertemporal hedging demand only when the rate at which investors discount future utility of consumption is smaller than the rate at which shocks to precision die out.

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1387

<!-- Page:19 -->

<center><i>Figure2 Effect on optimal portfolio demand of compensated changes in the instantaneous correlation of shocks to volatilityandstockreturns <img src="https://latex.codecogs.com/svg.image?(-\rho)" style="vertical-align: middle; height: 1.2em;" alt="(-\rho)" class="latex-formula"/> This figure plots the ratio of intertemporal hedging demand to myopic demand for investors with <img src="https://latex.codecogs.com/svg.image?\psi=1/2" style="vertical-align: middle; height: 1.2em;" alt="\psi=1/2" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\gamma=\{2,4,20\}" style="vertical-align: middle; height: 1.2em;" alt="\gamma=\{2,4,20\}" class="latex-formula"/> asweconsider changesintheinstantaneous correlationbetween shocks tovolatility and stock returns,while holding the rest of the parameters constant at their monthly estimates shown inTable 1. The vertical line intersects the horizontal axis at the value implied by the monthly estimate of <img src="https://latex.codecogs.com/svg.image?-\rho" style="vertical-align: middle; height: 1.2em;" alt="-\rho" class="latex-formula"/></i></center>

<div align="center">
  <img src="images/7e8309f1c62fe191ed448fa2443b5f6b1aeafd40c3f6ab98e985c3566144e082.jpg" style="max-width: 70%;" />
</div>

Second, we consider the effect of correlation. Figure 2 repeats the experiment of Figure 1, except that it considers changes in the correlation coefficient $\rho$ .The effect of changes in correlation is somewhat larger than the effect of compensated changes in persistence, especially when we consider correlations close to perfect, but it is still modest. Figure 2 also shows that intertemporal hedging demand increases monotonically with compensated increases in persistence. 

Third, we explore the effect on intertemporal hedging demand of changes in the unconditional variance of precision, while keeping its mean constant. Since $\mathrm{Var}(y)=\sigma^{2}\theta/2\kappa$ , we can implement this exercise by considering uncompensated changes in $\sigma$ or $\kappa$ . We report results based on varying $\sigma$ and note that varying $\kappa$ instead of $\sigma$ produces similar results. We determine a reasonable range of variation for $\sigma$ using the fact that the unconditional variance of stock returns also changes with $\sigma$ [Equation (4)]; we consider values of $\sigma$ implying stock return volatilities between 18 and $30\%$ . Figure 3 reports the result of this experiment, with the stock return volatility implied by $\sigma$ on the horizontal axis. 

---

1388

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:20 -->

<center><i>Figure 3: Effect on optimal portfolio demand of changes in the variance of precision</i></center>

<div align="center">
  <img src="images/c856f03470ee2e1e7908b516496097d047bce938e3f0b0a7947e9f1c9974d434.jpg" style="max-width: 70%;" />
</div>

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>This figure plots the ratio of intertemporal hedging demand to myopic demand for investors with <img src="https://latex.codecogs.com/svg.image?\psi=1/2" style="vertical-align: middle; height: 1.2em;" alt="\psi=1/2" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\gamma=\{2,4,20\}" style="vertical-align: middle; height: 1.2em;" alt="\gamma=\{2,4,20\}" class="latex-formula"/> as we consider changes in the unconditional variance of precision, while keeping its mean constant. Since <img src="https://latex.codecogs.com/svg.image?E[y_{t}]=\theta" style="vertical-align: middle; height: 1.2em;" alt="E[y_{t}]=\theta" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\mathbf{Var}(y_{t})=\sigma^{2}\theta/2\kappa" style="vertical-align: middle; height: 1.2em;" alt="\mathbf{Var}(y_{t})=\sigma^{2}\theta/2\kappa" class="latex-formula"/>, we implement this exercise by changing <img src="https://latex.codecogs.com/svg.image?\sigma" style="vertical-align: middle; height: 1.2em;" alt="\sigma" class="latex-formula"/> and holding the rest of the parameters constant at their monthly estimates shown in Table 1. We consider values of <img src="https://latex.codecogs.com/svg.image?\sigma" style="vertical-align: middle; height: 1.2em;" alt="\sigma" class="latex-formula"/> implying stock return volatilities between 18 and <img src="https://latex.codecogs.com/svg.image?30\%" style="vertical-align: middle; height: 1.2em;" alt="30\%" class="latex-formula"/>. To facilitate interpretation, the horizontal axis plots stock return volatility instead of <img src="https://latex.codecogs.com/svg.image?\sigma" style="vertical-align: middle; height: 1.2em;" alt="\sigma" class="latex-formula"/> or <img src="https://latex.codecogs.com/svg.image?\mathbf{Var}(y_{t})" style="vertical-align: middle; height: 1.2em;" alt="\mathbf{Var}(y_{t})" class="latex-formula"/>. The vertical line intersects the horizontal axis at the value implied by the monthly estimate of the unconditional standard deviation of stock returns.</i>
</div>
</center>

Figure 3 shows that intertemporal hedging demand is highly responsive to changes in the variance of precision, especially when investors are highly risk averse. However, this could be the result of changes in the unconditional variance of stock returns rather than the result of changes in the unconditional variance of precision, since both moments increase with $\sigma$. To isolate one effect from the other, Figure 4 evaluates the effect on intertemporal hedging demand of changes in the unconditional variance of stock returns that leave the unconditional variance of precision constant.$^{11}$ Figure 4 shows that this effect is relatively small. Thus this analysis suggests that intertemporal hedging demand is comparatively more responsive to changes in the unconditional variance of the state variable than to changes in the persistence of shocks to this variable, its mean, or its correlation with stock returns.

---

From Equation (4), we can change the unconditional variance of stock returns by changing $\theta$. To keep $\operatorname{Var}(y)=\sigma^{2}\theta/2\kappa$ constant, we also need to change $\sigma$ or $\kappa$ as $\theta$ changes. We choose to vary $\sigma$. Varying $\kappa$ instead of $\sigma$ does not change the conclusions.

<!-- Page:21 -->

<center><i>Figure 4: Effect on optimal portfolio demand of changes in the unconditional variance of stock returns, holding the unconditional variance of precision constant</i></center>

<div align="center">
  <img src="images/a8500894b8dc665ad13a05723f7f1e4e5e7567de0016bdbb6c805631fb917e5d.jpg" style="max-width: 70%;" />
</div>

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>This figure plots the ratio of intertemporal hedging demand to myopic demand for investors with <img src="https://latex.codecogs.com/svg.image?\psi=1/2" style="vertical-align: middle; height: 1.2em;" alt="\psi=1/2" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\gamma=\{2,4,20\}" style="vertical-align: middle; height: 1.2em;" alt="\gamma=\{2,4,20\}" class="latex-formula"/> as we consider changes in the unconditional variance of stock returns, holding the unconditional variance of precision constant. Since <img src="https://latex.codecogs.com/svg.image?\mathrm{Var}(d%20S_{t}/S_{t})\approx1/\theta%2B\mathrm{Var}(y_{t})/\theta^{3}" style="vertical-align: middle; height: 1.2em;" alt="\mathrm{Var}(d S_{t}/S_{t})\approx1/\theta+\mathrm{Var}(y_{t})/\theta^{3}" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?\mathbf{Var}(y_{t})=\sigma^{2}\theta/2\kappa" style="vertical-align: middle; height: 1.2em;" alt="\mathbf{Var}(y_{t})=\sigma^{2}\theta/2\kappa" class="latex-formula"/> we implement the change in <img src="https://latex.codecogs.com/svg.image?\mathrm{Var}(d%20S_{t}/S_{t})" style="vertical-align: middle; height: 1.2em;" alt="\mathrm{Var}(d S_{t}/S_{t})" class="latex-formula"/> by varying <img src="https://latex.codecogs.com/svg.image?\theta" style="vertical-align: middle; height: 1.2em;" alt="\theta" class="latex-formula"/> and we hold <img src="https://latex.codecogs.com/svg.image?\mathbf{Var}(y_{t})" style="vertical-align: middle; height: 1.2em;" alt="\mathbf{Var}(y_{t})" class="latex-formula"/> constant by varying <img src="https://latex.codecogs.com/svg.image?\sigma" style="vertical-align: middle; height: 1.2em;" alt="\sigma" class="latex-formula"/> appropriately. We hold the rest of the parameters constant at their monthly estimates shown in Table 1. We consider values of <img src="https://latex.codecogs.com/svg.image?\theta" style="vertical-align: middle; height: 1.2em;" alt="\theta" class="latex-formula"/> implying stock return volatilities between 18 and <img src="https://latex.codecogs.com/svg.image?30\%" style="vertical-align: middle; height: 1.2em;" alt="30\%" class="latex-formula"/>. The vertical line intersects the horizontal axis at the value implied by the monthly estimate of the unconditional standard deviation of stock returns.</i>
</div>
</center>

Table 4 explores the implications for consumption and savings of time variation in volatility. Panel A in the table reports the exponentiated optimal mean log consumption-wealth ratio and Panel $\mathbf{B}$ reports the long-term expected return on wealth. The numbers in the table are based on the monthly sample. Panel A shows that optimal consumption depends on both $\gamma$ and $\psi$. It is a positive monotonic function of $\gamma$ when $\psi>1$, while it is a negative monotonic function of $\gamma$ when $\psi<1$. It is independent of $\gamma$ and equal to the rate of time preference $\beta$ $(6\%)$ when $\psi=1$ as shown in Section 3.

These patterns are identical to those found by Campbell and Viceira (1999) in the context of a model with time-varying expected returns. We simply summarize here their explanation for those patterns. Consider first the right-hand column of Panel A. It reports the exponentiated mean optimal consumption-wealth ratio of investors who are extremely reluctant to substitute consumption intertemporally ($\psi$ is very close to zero)

---

1390

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:22 -->

<center><i>Table4 Optimal consumption-wealth ratio and long-term expected return on wealth (sample:1926.01-2000.12)  E.I.S. </i></center>

| R.R.A. | 1/0.75 | 1.00 | 1/1.5 | 1/2 | 1/4 | 1/10 | 1/20 | 1/40 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|  |  |  |  |  |  |  |  |  |
|  |  | A. Consumption–wealth ratio (%): $C_t/X_t = \exp \{E[c_t-x_t]\} \times 100$ |  |  |  |  |  |  |
| 0.75 | 3.30 | 6.00 | 8.68 | 10.01 | 12.01 | 13.21 | 13.61 | 13.81 |
| 1.00 | 4.44 | 6.00 | 7.56 | 8.34 | 9.51 | 10.22 | 10.45 | 10.57 |
| 1.50 | 5.51 | 6.00 | 6.49 | 6.74 | 7.11 | 7.33 | 7.41 | 7.45 |
| 2.00 | 6.02 | 6.00 | 5.98 | 5.97 | 5.95 | 5.94 | 5.93 | 5.93 |
| 4.00 | 6.77 | 6.00 | 5.23 | 4.84 | 4.25 | 3.90 | 3.79 | 3.73 |
| 10.0 | 7.21 | 6.00 | 4.79 | 4.18 | 3.27 | 2.72 | 2.54 | 2.45 |
| 20.0 | 7.36 | 6.00 | 4.64 | 3.96 | 2.95 | 2.33 | 2.13 | 2.03 |
| 40.0 | 7.43 | 6.00 | 4.57 | 3.86 | 2.78 | 2.14 | 1.93 | 1.82 |
|  |  |  |  |  |  |  |  |  |
|  |  | B. Long-term expected return on wealth (%): $(\pi(\theta)(\mu-r) + r) \times 100$ |  |  |  |  |  |  |
| 0.75 | 26.31 | 26.29 | 26.27 | 26.26 | 26.25 | 26.24 | 26.24 | 26.24 |
| 1.00 | 19.87 | 19.87 | 19.87 | 19.87 | 19.87 | 19.87 | 19.87 | 19.87 |
| 1.50 | 13.61 | 13.61 | 13.61 | 13.61 | 13.61 | 13.61 | 13.61 | 13.61 |
| 2.00 | 10.53 | 10.53 | 10.53 | 10.53 | 10.53 | 10.53 | 10.53 | 10.53 |
| 4.00 | 5.98 | 5.98 | 5.98 | 5.98 | 5.97 | 5.97 | 5.97 | 5.97 |
| 10.0 | 3.28 | 3.28 | 3.28 | 3.28 | 3.28 | 3.28 | 3.28 | 3.28 |
| 20.0 | 2.39 | 2.39 | 2.39 | 2.39 | 2.39 | 2.39 | 2.39 | 2.39 |
| 40.0 | 1.95 | 1.94 | 1.94 | 1.94 | 1.94 | 1.94 | 1.94 | 1.94 |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>Panel A reports percentage exponentiated mean optimal log consumption-wealth ratiosfor different coefficients ofrelativeriskaversion andelasticitiesofintertemporalsubstitutionof consumption.Panel B reports the percentage unconditional mean of the log return on wealth. These numbers are based on the monthlyparameterestimatesof thejointprocessforreturnandvolatilityreportedinTable1. </i>
</div>
</center>

but differ in their aversion to risk. These investors wish to maintain a constant expected consumption growth rate, regardless of current investment opportunities. They can do this by consuming the long-run average return on their portfolio, with a precautionary-savings adjustment for risk. If the investor is highly risk averse, as she is in the bottom of the column, then she chooses a portfolio which is almost fully invested in the riskless asset and earns a low return with little risk. If she is highly risk tolerant, she chooses a levered portfolio with a high expected return and risk. This explains why the mean log consumption-wealth ratio is higher at the top of the column than at the bottom. Precautionary savings explain why the mean log consumption-wealth ratio is very close to the long-term expected return on wealth at the bottom of the column, and is lower at the top.

Now consider what happens as investors become more willing to substitute consumption intertemporally; that is, as $\psi$ increases and we move to the left in Panel A. Ignoring precautionary savings effects, an investor who is willing to substitute intertemporally will have higher saving and lower consumption than an individual who is reluctant to substitute intertemporally, if the time-preference adjusted rate of return on saving is positive, but will have lower saving and higher current consumption if it negative. Panel A illustrates this pattern. Investors with low-risk aversion $\gamma$ at the top of the panel

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1391

<!-- Page:23 -->

choose portfolios with high expected returns, so a higher $\psi$ corresponds to a lower average consumption-wealth ratio; investors at the bottom of the table choose portfolios with low expected returns, and so for these investors a higher $\psi$ corresponds to a higher consumption-wealth ratio.

Finally, Table 5 investigates the effect on optimal portfolio choice when expected returns change with volatility, using the model of Section 4. This model assumes that

$$
E_t\left[\frac{dS_t}{S_t} - rdt\right] = \alpha_1 + \alpha_2 v_t. \tag{24}
$$

<center><i>Table5 Mean optimal percentage allocation to stocks when expected stock excess returns are an affine function of volatility (sample:1926.01-2000.12) <img src="https://latex.codecogs.com/svg.image?(E_{t}[d%20S_{t}/S_{t}-r%20d%20t]=\alpha_{I}%2B\alpha_{2}\nu_{t})" style="vertical-align: middle; height: 1.2em;" alt="(E_{t}[d S_{t}/S_{t}-r d t]=\alpha_{I}+\alpha_{2}\nu_{t})" class="latex-formula"/>  02 </i></center>

| R.R.A. | −2.00 | −0.75 | −0.25 | 0.00 | 0.25 | 0.75 | 2.00 |
|---|---:|---:|---:|---:|---:|---:|---:|
| | | | | A. Mean optimal allocation to stocks (%) | | | |
| 0.75 | 322.33 | 311.56 | 306.80 | 305.32 | 303.83 | 300.85 | 294.03 |
| 1.00 | 236.25 | 229.64 | 227.11 | 226.55 | 225.99 | 224.87 | 222.06 |
| 1.50 | 153.22 | 150.32 | 149.36 | 149.35 | 149.36 | 149.37 | 149.34 |
| 2.00 | 113.20 | 111.69 | 111.24 | 111.37 | 111.52 | 111.82 | 112.57 |
| 4.00 | 55.30 | 55.04 | 55.02 | 55.20 | 55.38 | 55.75 | 56.77 |
| 10.0 | 21.81 | 21.83 | 21.87 | 21.96 | 22.06 | 22.26 | 22.83 |
| 20.0 | 10.86 | 10.88 | 10.91 | 10.96 | 11.01 | 11.12 | 11.44 |
| 40.0 | 5.42 | 5.43 | 5.45 | 5.47 | 5.50 | 5.56 | 5.72 |
| | | | | B. Intercept of hedging demand (%) | | | |
| 0.75 | -2.03 | -0.35 | -0.04 | 0.00 | -0.04 | -0.36 | -2.08 |
| 1.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| 1.50 | 1.24 | 0.19 | 0.02 | 0.00 | 0.02 | 0.20 | 0.31 |
| 2.00 | 1.44 | 0.22 | 0.02 | 0.00 | 0.03 | 0.23 | 1.56 |
| 4.00 | 1.13 | 0.17 | 0.02 | 0.00 | 0.02 | 0.18 | 1.26 |
| 10.0 | 0.55 | 0.08 | 0.01 | 0.00 | 0.01 | 0.09 | 0.63 |
| 20.0 | 0.29 | 0.04 | 0.00 | 0.00 | 0.01 | 0.05 | 0.34 |
| 40.0 | 0.15 | 0.02 | 0.00 | 0.00 | 0.00 | 0.02 | 0.18 |
| | | | | C. Slope of hedging demand times $\theta$ (%) | | | |
| 0.75 | 9.36 | 5.72 | 4.02 | 3.25 | 2.55 | 1.39 | 0.02 |
| 1.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| 1.50 | -5.52 | -2.96 | -2.07 | -1.68 | -1.32 | -0.73 | -0.01 |
| 2.00 | -6.37 | -3.36 | -2.34 | -1.90 | -1.50 | -0.84 | -0.02 |
| 4.00 | -4.89 | -2.54 | -1.77 | -1.44 | -1.14 | -0.64 | -0.01 |
| 10.0 | -2.36 | -1.22 | -0.85 | -0.70 | -0.55 | -0.31 | -0.01 |
| 20.0 | -1.25 | -0.65 | -0.45 | -0.37 | -0.29 | -0.16 | 0.00 |
| 40.0 | -0.64 | -0.33 | -0.23 | -0.19 | -0.15 | -0.08 | 0.00 |

Panel A reports mean optimal allocations to stocks based on Equation (23) in Proposition 3, for different values of the coefficient of relative risk aversion and the slope of the expected return function. The elasticity of intertemporal substitution of consumption is set to 0.50 throughout the table. Panel B reports the percentage value of the intercept of the intertemporal hedging component, and Panel C reports the percentage value of the slope of the intertemporal hedging demand times $\theta$ the unconditional mean of precision. Mean intertemporal hedging demands obtain by adding the numbers in Panel B and C. These numbers are based on the monthly parameter estimates of the joint process for return and volatility reported in Table 1, except that we vary the unconditional mean of precision and the intercept of the expected return function as we vary the slope as to hold the unconditional mean and variance are those implied by monthly estimates of the model with constant expected returns shown in Table 1.

---

1392

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:24 -->

Table 5 explores how the allocations of Table 2 change as $\alpha_{2}$ moves away from zero, holding the unconditional mean and variance of stock returns constant. To hold the unconditional mean excess return at the same value as in the benchmark case $\alpha_{2}=0$ , for each value of $\alpha_{2}$ ,we set $\alpha_{1}=\mu-r-\alpha_{2}\mathbf{E}[v_{t}]$ ,where $\mathbf{E}[v_{t}]$ is given in Equation (4). To hold the unconditional variance of stock returns constant, we recompute $\theta$ for each value of $\alpha_{2}$ . Since we do not have an analytical expression for the variance of stock returns when expected returns are time varying, we use Monte Carlo simulation to determine the value of $\theta$ that leaves the variance unchanged as we move $\alpha_{2}$ away from zero.$^{12}$

We consider values of $\alpha_{2}$ equal to $\{-2.00,-0.75,-0.25,0.00,0.25,0.75,$ 2.00}. $^{13}$ Each row of Table 5 reports allocations corresponding to this set of values of $\alpha_{2}.$ . given a particular value of $\gamma$ .All entries in the table assume $\psi=1/2$ . Panel A reports mean optimal allocations to stocks based on Equation (23) in Proposition 3. Panel B reports the percentage value of the intercept of the intertemporal hedging component, and Panel C reports the percentage value of the slope of the intertemporal hedging demand times $\theta$ the unconditional mean of precision. Of course, the mean intertemporal hedging demands obtain by adding the numbers in Panel B and C.

Panel A shows that changes in $\alpha_{2}$ have a large impact on mean optimal portfolio demands. However, this effect operates mainly through the myopic component of portfolio demand. Panel B and C show that the intercept and the slope (times the mean of precision) of intertemporal hedging demands are too small in absolute value to have any significant impact on total portfolio demand when using parameter estimates based on the monthly dataset.

The negative sign of the instantaneous correlation between volatility and stock returns implies that the intercept is negative for $\gamma<1$ and positive for $\gamma>1$ , while the slope is positive for $\gamma<1$ and negative for $\gamma>1$ . We have noted in Section 4 that the slope captures intertemporal hedging effects of unrewarded changes in volatility, while the intercept captures intertemporal hedging effects of rewarded changes in volatility-it is zero when expected excess returns are constant, and it increases as $\alpha_{2}$ becomes larger in absolute value. Table 5 shows that the effect of the slope is relatively more important than the effect of the intercept, at least for values of $\alpha_{2}$ close to zero.

### 5.3 The accuracy of the approximate solution

The portfolio allocations and consumption-wealth ratios shown in Section 6 are based on an analytical solution for the optimal rules that is

---

$^{12}$ For achrn,wehave generatd 1000 tme erieof th process,ach 3 year in ngth, withtm st $d t=0{,}01$ (or about three days). $^{13}$ This choice is based on th fact that an estimation of the model with time-varying expected excesreturns gives apoint estimate of 0.75for $\alpha_{2}$ with a standard error of 0.41.

<!-- Page:25 -->

<center><i>Table6 Unconditional standard deviation of the optimal log consumption-wealth ratio <img src="https://latex.codecogs.com/svg.image?(\%)" style="vertical-align: middle; height: 1.2em;" alt="(\%)" class="latex-formula"/> (Sample: 1926.01-2000.12) <img src="https://latex.codecogs.com/svg.image?\left(\sqrt{A_{1}^{2}\sigma^{2}\theta/2\kappa}\times100\right)" style="vertical-align: middle; height: 1.2em;" alt="\left(\sqrt{A_{1}^{2}\sigma^{2}\theta/2\kappa}\times100\right)" class="latex-formula"/>  E.1.S. </i></center>

| R.R.A. | 1/0.75 | 1.00 | 1/1.5 | 1/2 | 1/4 | 1/10 | 1/20 | 1/40 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.75 | 1.70 | 0.00 | 1.48 | 2.14 | 3.07 | 3.59 | 3.76 | 3.84 |
| 1.00 | 1.20 | 0.00 | 1.11 | 1.63 | 2.39 | 2.82 | 2.96 | 3.03 |
| 1.50 | 0.76 | 0.00 | 0.74 | 1.11 | 1.64 | 1.96 | 2.07 | 2.12 |
| 2.00 | 0.56 | 0.00 | 0.56 | 0.84 | 1.25 | 1.51 | 1.59 | 1.63 |
| 4.00 | 0.27 | 0.00 | 0.28 | 0.42 | 0.64 | 0.78 | 0.82 | 0.85 |
| 10.0 | 0.11 | 0.00 | 0.11 | 0.17 | 0.26 | 0.32 | 0.34 | 0.35 |
| 20.0 | 0.05 | 0.00 | 0.06 | 0.09 | 0.13 | 0.16 | 0.17 | 0.17 |
| 40.0 | 0.03 | 0.00 | 0.03 | 0.04 | 0.07 | 0.08 | 0.08 | 0.09 |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>E.1.S.</i>
</div>
</center>

This table reports annualized, percentage values of the unconditional standard deviation of the optimal log consumption-wealth ratio for different coefficients of relative risk aversion and elasticities of intertemporal substitution of consumption. These numbers are based on the monthly parameter estimates of the joint process for return and volatility reported in Table1.

The solution is exact only for $\psi=1$. In all other cases this solution is approximate, based on an expansion of the optimal log consumption-wealth ratio around its unconditional mean. Campbell (1993) and Campbell and Viceira (2002) note that this solution method is accurate provided that the log consumption-wealth ratio is not too variable around its unconditional mean.

Table 6 reports annualized, percentage values of the unconditional standard deviation of the optimal log consumption-wealth ratio, $|A_{1}|\sqrt{\mathbf{Var}\left(y_{t}\right)}=|A_{1}|\sigma\sqrt{\theta/2\kappa}$. The log consumption-wealth ratio exhibits low volatility in most cases, both in absolute terms and relative to its mean. The exceptions are investors with very low elasticities of intertemporal substitution of consumption and low coefficients of relative risk aversion. These results suggest that this solution is likely to be accurate for values of $\psi$ far from one, in line with the results of Campbell (1993), Campbell and Koo (1997) and Campbell et al. (2001) for models with time variation in interest rates and expected excess returns.

## 6. Conclusion

We have explored in this paper dynamic optimal consumption and portfolio choice when asset return volatility is time varying. We have considered a model where long-horizon investors with Duffie and Epstein 1992a, 1992b recursive preferences over intermediate consumption have two assets available for investment, a riskless bond and a risky asset (stocks). Stock return precision-the reciprocal of volatility-follows a mean-reverting process which is instantaneously correlated with stock returns.

We have shown that this model has an analytical solution which is exact when investors have unit elasticity of intertemporal substitution of consumption-but not necessarily unit coefficient of relative risk aversion.

---

1394

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:26 -->

aversion-and approximate in all other cases. Optimal portfolio demand for stocks is a linear combination of two components: a myopic (or mean-- variance) component, and an intertemporal hedging component, both of which change linearly with precision. We have used this solution to analytically characterize intertemporal hedging demand in the presence of volatility risk and to assess its quantitative importance. To this end, we have conducted a comprehensive calibration exercise based on estimates of the joint process for stock market returns and volatility using monthly U.S. stock market returns from 1926 to 2000, and annual returns from 1871 to 2000.

Our estimates of the instantaneous correlation of precision with stock returns are large and positive, implying a large negative correlation of volatility with stock returns. Shocks to precision exhibit low persistence and variance, especially in the monthly sample. These estimates generate small, negative intertemporal hedging demands for investors with coefficients of relative risk aversion larger than one. By contrast, Brandt (1999), Campbell and Viceira (1999, 2001, 2002), Campbell, Chan and Viceira (2003) and others have shown that the estimated time variation in risk premia or in real interest rates in the U.S. results in much larger intertemporal hedging demands for investors with similar preferences. A comprehensive comparative statics exercise suggests that the unconditional variance of precision has to be much larger to generate intertemporal hedging demands of comparable size.

An important caveat of our empirical analysis is that we have counterfactually assumed that investors observe volatility (or precision), and that they take as true parameters our empirical estimates of the joint process for returns and volatility. In practice, however, investors do not observe volatility, and they do not know the parameters of the process for volatility or even the process itself. They must infer all of that from observed returns, and they must account for this uncertainty when they make their portfolio decisions. The large standard errors of some of our point estimates, and the significant differences in the estimates from the monthly sample and the annual sample, suggest that these may be important issues. Barberis (2000), Brennan (1998), Xia (2001), and others have shown that parameter uncertainty and learning can have a large effect on optimal long-term investment strategies. Integrating all of these effects into a one single empirically implementable framework is beyond the scope of this paper, and a challenging task for future research.

We have also considered a model where expected stock excess returns are an affine function of volatility. In this case, optimal portfolio demand and its hedging component are both affine functions of precision. A possible extension of this model could allow for both expected stock returns and risk to vary over time as a function of a vector of state variables. Intertemporal hedging demand would then depend on the resulting process for the Sharpe ratio of stocks, and how it correlates

---

1395

<!-- Page:27 -->

with the vector of state variables. However, Campbell (1987), Harvey (1989, 1991), Glosten, Jagannathan, and Runkle (1993), Ait-Sahalia and Brandt (2001), and others have modeled time-varying expected returns and volatility jointly and found that the effects of state variables on expected returns are stronger than their effects on volatility. This suggests that the negative hedging demand associated with volatility risk will be modest even in a framework that combines time-varying volatility with time-varying expected returns.

## Appendix A: Derivation of Optimal Policies Under Constant Expected Returns

Proof of Proposition 1. Substituting the first-order conditions into Equation (9) and rearranging gives the Bellman equation:

$$
0 = f(C(J), J) - J_X C(J) - \frac{1}{2} \frac{(J_X)^2}{J_{XX}} (\mu - r)^2 yt - \frac{J_X J_{Xy}}{J_{XX}} \rho \sigma (\mu - r) yt + J_X X_t r - \frac{1}{2} \frac{(J_{Xy})^2}{J_{XX}} \rho^2 \sigma^2 yt + J_y \kappa (\theta - y_t) + \frac{1}{2} J_{yy} \sigma^2 yt,
$$

where $C(J)$ denotes the expression for consumption resulting from Equation (10). Substitution of Equation (12) into the Bellman equation (25) yields an ordinary differential equation (ODE). This equation leads to two equations for $A$ and $B$

$$
a A^{2}+b A+c=0,\eqno(26)
$$

$$
(1 - \gamma)(\beta \log \beta + r - \beta) - \beta B + \kappa \theta A = 0, \tag{27}
$$

where

$$
a = \frac{1}{2\gamma(1-\gamma)}\left[\gamma\left(1-\rho^z\right) + \rho^z\right], \tag{28}
$$

$$
b = \frac{\rho \sigma (\mu - r)}{\gamma} - \frac{\beta + \kappa}{1 - \gamma} \tag{29}
$$

$$
c = \frac{(\mu - r)^2}{2\gamma} \tag{30}.
$$

Equation (26) is quadratic in $A$, and equation (27) is linear in $B$ given $A$. For general parameter values, the equation for $A$ has two roots. These roots are real if the discriminant of the equation, $\Delta=b^{2}-4a c$, is non-negative. When $\gamma>1$, it is immediate to see by simple inspection that $\Delta$ is always non-negative. When $\gamma<1$, $\Delta$ is positive provided that

$$
\Delta = \left( \frac{\beta + \kappa}{1 - \gamma} \right) - 2 \frac{\rho \sigma (\mu - r)}{\gamma} - \frac{\sigma^2 (\mu - r)^2}{\gamma (\beta + \kappa)} > 0. \tag{31}
$$

This expression results from simple algebraic manipulation of the expression for $\Delta$

---

1396

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:28 -->

To determine the sign of the roots of Equation (26), we note that the product of the roots of the equation is equal to

$$
\frac{c}{a} = \frac{(1 - \gamma)(\mu - r)^2}{\sigma^2[\gamma(1 - \rho^2) + \rho^2]}
$$

Since $\left[\gamma\big(1-\rho^{2}\big)+\rho^{2}\right]>0$ for all $\gamma$ cla is always negative when $\gamma>1$ and positive when $\gamma<1$ Therefore, the roots of the equation have opposite signs when $\gamma>1$ , and they have the same sign when $\gamma<1$

We show now that only one of the two possible solutions for $A$ has a limit as $\gamma\to1$ that equals the well-known solution in the special case of log utility $\gamma=\psi=1$), for which $A=B=0$ and the value function is simply $\log(X_{t}).$ (Merton, 1969, 1971, 1973). The limit of $A$ as $\gamma\to1$ is given by

$$
\lim_{{\gamma \to 1}} A = \frac{{(\beta + \kappa) \mp \sqrt{{(\beta + \kappa)^2}}}}{{\sigma^2}},
$$

where thenegative signholdswhen $\gamma>1$ ,and thepositive sign holds when $\gamma<1$ .For general parameter values, this expression is zero only if we pick the positive root of the discriminant $\Delta$ when $\gamma<1$ ,andthenegativerootwhen $\gamma<1.$ Note that $A=0$ and $\gamma=1$ impliesimmediately that $B=0$

Proof of Proposition 2. The value function follows immediately from Equations (16) and (17). Substitution of Equation (17) for $\beta^{\psi}H^{-1}$ in the first term of Equation (16) results in an ODE whose solution has the form $H=\exp\{A_{1}y_{t}+B_{1}\}$, where

$$
a_1 A_1^2 + b_1 A_1 + c_1 = 0 \tag{32}
$$

$$
h_0 - h_1[B_1 - \psi \log \beta] - \psi \beta - r(1 - \psi) + \kappa \theta A_1 = 0 \tag{33}
$$

$$
a_1 = \frac{\sigma^2}{2\gamma} \left(\frac{1-\gamma}{1-\psi}\right) [\gamma(1-\rho^2) + \rho^2], \tag{34}
$$

$$
b_{1} = (h_{1} + \kappa) - \frac{(1 - \gamma) \rho \sigma (\mu - r)}{\gamma}, \tag{35}
$$

$$
c_{1} = \frac{(1 - \psi)(\mu - r)^{2}}{2\gamma}. \tag{36}
$$

The analysis of the quadratic equation (32) for $A_{1}$ is parallel to the analysis of the quadratic equation (26) for $A$ in the $\psi=1$ case,so that we simply state here the properties of $\scriptstyle A_{1}$ derive from this analysis. First, $A_{1}/(1-\psi)$ is independent of $\psi$ given $h_{1}$ Second, comparison of Equations (34)-(36) with Equations (28)-(30) shows that $-A_{1}/(1-\psi)$ and $A_{1}/(1-\gamma)$ are non-negative identical functions of $h_{1}$ and $\beta$ ,respectively. Thus $A_{1}$ reduces to $\boldsymbol{A}$ when $h_{1}=\beta$ .Third when $\gamma>1$ ,the discriminant of Equation (32) is always positive and the roots of the equation are real and have opposite sign; when $\gamma<1$ ,the discriminant can have either sign but, if it is positive, the roots of the equation are real and have the same sign. However, only the positive square root of the discriminant ensures in both cases that the approximate solution approachestheexactsolutionwhen $\psi=1$

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1397

<!-- Page:29 -->

Finally, the optimal policies follow from Equation (18) and the first order conditions (11) and (15).

Convergence of approximate solution to exact solution in special cases. An important feature of this approximate solution is that it delivers the exact solution in those cases where this solution is known: log utility, unit elasticity of intertemporal substitution, and constant investment opportunities.

For convenience, we note here that the solution to the quadratic equation (32) for $A_{1}$

$$
A_1 = \frac{\frac{(1-\gamma)\rho\sigma(\mu-r)}{r} - (h_1 + \kappa) + \sqrt{\left((h_1 + \kappa) - \frac{(1-\gamma)\rho\sigma(\mu-r)}{r}\right)^2 - \frac{\sigma^2(\mu-r)^2(1-\gamma)[\gamma(1-\rho^2) + \rho^2]}{\gamma^2}}}{\frac{\sigma^2}{\gamma}\left(\frac{1-\gamma}{1-\psi}\right)[\gamma(1-\rho^2) + \rho^2]} \tag{37}
$$

For log utility $(\gamma=\psi\equiv1)$, we find by direct substitution of $\psi=1$ into Equation (37) that $A_{1}=0$. Further substitution of $\psi=1$ into Equation (33) for $B_{1}$ shows that $B_{1}=0$ when $h_{1}=\beta$. This implies that $C_{t}/X_{t}~=~\beta$, which is in turn consistent with $h_{1}=\exp\{\mathrm{E}[\log(C_{t}/X_{t})]\}=\beta$. Now, using Equation (37) it is straightforward to check that

$$
\lim_{\gamma \to 1} \frac{1 - \gamma}{(1 - \psi) \gamma} A_1 = \lim_{\gamma \to 1} \left( 1 - \frac{1}{\gamma} \right) \mathcal{A}_1 = 0, \tag{38}
$$

so that $\pi_{t}=(\mu-r)y_{t}$. This is the exact solution to the problem with log utility reported in Merton (1969).

When $\psi=1$ but $\gamma\neq1$, we have that $C_{t}/X_{t}=\beta$ and $h_{1}=\beta$ using the same arguments as in the log utility case. However, the limit Equation (38) is not necessarily zero and the hedging component of $\pi_{t}$ does not vanish. That is, the optimal consumption rule is myopic, while the optimal portfolio rule is not. This is the case discussed in Section 3. Note that, when $\gamma=1$ but $\psi=1$, the result is reversed: The hedging component of $\pi_{t}$ vanishes and $\pi_{t}=(\mu-r)y_{t}$, but consumption relative to wealth is not constant.

Finally, when investment opportunities are constant, implying $\kappa=\sigma=0$ and $\upsilon_{t}\equiv\upsilon$, both policies are myopic. Substitution of these parameter values into the expressions for $a_{1},b_{1}$ and $c_{1}$ in Equations (34)-(36), shows that Equation (32) reduces to a linear equation for $A_{1}$ with solution

$$
A_{1} = - \frac{(\mu - r)^{2}(1 - \psi)}{2\gamma h_{1}}. \tag{39}
$$

so that $\mathcal{A}_{1}=(\mu-r)^{2}/2\gamma h_{1}$. Note, however, that $\sigma=0$ implies that the optimal portfolio rule is myopic, even though $\mathcal{A}_{1}$ is not necessarily zero: $\pi_{t}=(\mu-r)/\gamma v$

Further substitution of $\kappa=\sigma=0$ and $v_{t}\equiv v$ into Equation (32) shows that

$$
B_{1}=\frac{h_{1}(1-\log h_{1})+\psi \log \beta-\psi \beta-r(1-\psi)}{h_{1}}. \tag{40}
$$

Substitution of the solutions for $A_{1}$ and $B_{1}$ given in Equations (39) and (40) into Equation (19) gives

$$
c_t - x_t = \frac{-h_1 (1 - \log h_1) + \psi \beta + r (1 - \psi)}{h_1} + \frac{(\mu - r)^2 (1 - \psi)}{2 \gamma h_1} \frac{1}{v} \tag{41}.
$$

---

1398

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:30 -->

Since $c_{t}-x_{t}$ is constant and equal to $\log{h_{1,}}$ we can solve Equation (41) for $h_{1}$ We find that 

$$
h_1 = \frac{C_t}{X_t} = \psi \beta + \frac{1}{2} (1 - \psi) \frac{(\mu - r)^2}{\gamma \nu} + (1 - \psi) r.
$$

This is a generalized version of the exact solution given in Merton (1969) for the power utility case $\zeta\psi=1/\gamma$ when investment opportunities are constant.

## Appendix B: Derivation of Optimal Policies Under Time-Varying Expected Returns

We start by guessing the same functional forms for $J(X_{t},y_{t})$ and $I(y_{t})$ as in the model with constant expected return of Section 4. The Bellman equation for this problem then simplifies to an ODE in $H(y_{t})$ givenby:

$$
0 = -\beta^\psi H^{-1} + \psi \beta + \frac{(1 - \psi)}{2\gamma} \left(2\alpha_1 \alpha_2 + \alpha_1^2 y_t + \frac{\alpha_2^2}{y_t}\right) - \frac{\rho \sigma (1 - \gamma)}{\gamma} (\alpha_1 y_t + \alpha_2) \frac{H_y}{H} y_t + r(1 - \psi) + \frac{\rho^2 \sigma^2 (1 - \gamma)^2}{2\gamma (1 - \psi)} \left(\frac{H_y}{H}\right)^2 y_t - \frac{H_y}{H} \kappa (\theta - y_t) + \frac{\sigma^2}{2} \left(\frac{1 - \gamma}{1 - \psi} + 1\right) \left(\frac{H_y}{H}\right)^2 y_t - \frac{\sigma^2}{2} \frac{H_{yy}}{H_t} y_t
$$

We now guess that $H=\exp\{A_{1}y_{t}+A_{2}\log y_{t}+B\}$ and make the substitution

$$
\beta^\psi H^{-1} \approx h_0 + h_1(c_t - x_t), \tag{1}\\ - \log y_t \approx \log \theta_v + \frac{1}{\theta_v}(v - \theta_v) = \log \kappa - \log(\kappa \theta - \sigma^2) - 1 + \frac{\kappa \theta - \sigma^2}{\kappa} \frac{1}{y_t} \tag{2}
$$

After collecting terms in $1/y_{t},y_{t},$ and 1 we obtain two quadratic equations for $A_{1}$ and $A_{2}$ and a linear equation for $B$ given $\scriptstyle A_{1}$ and $A_{2}$ . The quadratic equations are:

$$
0 = \frac{(1-\psi)\alpha_2^2}{2\gamma} - \left[ \theta(h_1 + \kappa) - \left( \frac{h_1}{k} + \frac{1}{2} \right) \alpha^2 + \frac{(1-\gamma)\rho\sigma\alpha_2}{\gamma} \right] A_2 + \alpha_2 A_2^2, \tag{42}
$$

$$
0 = \frac{(1-\psi)\alpha_1^2}{2\gamma} - \left[ (h_1 + \kappa) - \frac{(1-\gamma)\rho\sigma\alpha_1}{\gamma} \right] A_1 + \alpha_1 A_1^2, \tag{43}
$$

where $a_{2}{=}a_{1}$ and $a_{1}$ is given in Equation (34). The optimal policies obtain immediately from substitution of the value function into the first order conditions (10) and (11).

Coefficient $A_{2}$ obtains as the solution to the quadratic Equation (42). Note that $A_{2}$ doesnotdependon $a_{1}$ .This equationhas tworoots.However,only theroot associated with the negative root of the discriminant ensures that $A_{2}=0$ when $a_{2}=0$ ---that is, it ensures the mutual consistency between the solution given in Proposition 2 and this solution.When $\gamma>1$ ,the roots of the equation are real and have opposite signs. The root associated with the negative root of the discriminant implies that $A_{2}/(1-\psi)>0$ When $\gamma<1$ ,the roots may be real or complex conjugate. The condition that ensures that the discriminant of the equation is non-negative, so that the roots are real, also implies that $A_{2}/(1-\psi)>0$

Coefficient $\scriptstyle A_{1}$ obtains as the solution to the quadratic Equation (43). Simple inspection of this equation and equation (32) shows that they are identical except that $\alpha_{1}$ replaces $(\mu-r)$ in Equations(43).Hence the analysis of $A_{1}$ presented in Section 4 is also valid here, and we have that $A_{2}/(1-\psi)<0$ , and $A_{1}=0$ when $a_{1}=0$ .Note that $\boldsymbol{A}_{1}$ doesnot depend on $\alpha_{2}$

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1399

<!-- Page:31 -->

References
Ait-Sahalia, Y., and M. Brandt, 2001, "Variable Selection for Porfolio Choice," Journal of Finance, 56, 1297-1351.
Andersen, T, L, Benzoni, and J. Lund, 2002, "An Empirical Investigation of Continuous-Time Equity Return Models," Journal of Finance, 57, 1239-1284.
Ang, A., and G. Bekaert, 2002, "International Asset Allocation with Regime Shifts," Review of Financial Studies, 15, 1137-1187.
Balduzzi, P., and A. Lynch, 1997, "Transaction Costs and Predictability: Some Utility Cost Calculations," Journal of Financial Economics, 52, 47-78.
Barberis,N. C., 2000, "Investing for the Long Run When Returns Are Predictable," Journal of Finance, 55,225-264.
Bollerslev, T., R. Y. Chou, and K. Kroner, 1992, "ARCH Modeling in Finance," Journal of Econometrics, 52, 5-59.
Brandt, M., 1999, "Estimating Portfolio and Consumption Choice: A Conditional Euler Equations Approach," Journal of Finance, 54, 1609-1645.
Brennan, M. J., 1998, "The Role of Learning in Dynamic Portfolio Decisions," European Finance Review, 1, 295-306.
Brennan, M. J., E. S. Schwartz, and R. Lagnado, 1996, "The Use of Treasury Bill Futures in Strategic Asset Allocation Programs," Finance Working Paper 7-96, Anderson Graduate School of Management, University of California-LosAngeles.
Brennan, M. J., E. S. Schwartz, and R. Lagnado, 1997, "Strategic Asset Allocation," Journal of Economic Dynamics and Control, 21, 1377-1403.
Campbell, J. Y., 1987, "Stock Returns and the Term Structure," Journal of Financial Economics, 18,373-399. Campbell, J.Y, 1993, "Intertemporal Asst Pricing without Consumption Data," American Economic Review, 83, 487-512.
Campbell, J. Y., and H. K. Koo, 1997, "A Comparison of Numerical and Analytical Approximate Solutions to an Intertemporal Consumption Choice Problem," Journal of Economic Dynamics and Control,21,273-95.
Campbell J. Y. and L. Hentschel, 1992, "No News is Good News. An Asymmetric Model of Changing Volatility in Stock Returns," Journal of Financial Economics, 31, 281-318.
Campbell, J. Y., and N. G. Mankiw, 1989, "Consumption, Income, and Interest Rates: Reinterpreting the Time-Series Evidence," in O. J. Blanchard and S.Fischer (eds), NBER Macroeconomics Annual 1989, MIT Press, Cambridge, MA.
Campbell, J. Y, and L. M. Viceira, 1999, "Consumption and Portfolio Decisions When Expected Returns Are Time Varying," Quarterly Journal of Economics, 114, 433-495.
Campbell, J.Y., and L. M. Viceira, 2001, "Who Should Buy Long-Term Bonds?" American Economic Review, 91, 99-127.
Campbell, J.Y, and L.M. Viceira, 2002, Strategic Asset Allocation: Portfolio Choice for Long-Tem Investors. Oxford University Press, Oxford, U.K.
Chacko, G., and L. M. Viceira, 2003, "Spectral GMM Estimation of Continuous-Time Processes," Journal of Econometrics,116,259-292.
Campbell, J. Y, Y, L. Chan, and L. M. Viceira. 2003, "A Multivariate Model of Strategic Asset Allocation," Journal of Financial Economics, 67, 41-80.
Campbell, J. Y.,J. Cocco, F. Gomes, P. J. Maenhout, and L. M. Viceira, 2001, "Stock Market Mean Reversion and the Optimal Equity Allocation of a Long-Lived Investor," European Finance Review. 5, 269-292.

---

1400

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:32 -->

Dynamic Consumption and Porifolio Choice
Campbell, J. Y., M. Lettau, B. G. Malkiel, and Y. Xu, 2001, “Have Individual Stocks Become More Volatile? An Empirical Exploration of Idiosyncratic Risk,” Journal of Finance, 56, 1-44.
Campbell J. Y., A. w. Lo, and A. C. MacKinlay, 1997, The Econometrics of Financial Markets, Princeton University Press, Princeton, NJ.
Cox, J. C., and C. Huang, 1989, “Optimal Consumption and Portfolio Policies when Asset Prices Follow a Diffusion Process,” Journal of Economic Theory, 49, 33-83.
Cox, J. C., J. E. Ingersoll, and S. Ross, 1985, “A Theory of the Term Structure of Interest Rates,” Econometrica, 53, 385-408.
Engle, R. F., T. Ito, and w. Lin, 1990, “Meteor Showers or Heat Waves? Heteroskedastic Intra-Daily Volatility in the Foreign Exchange Market,” Econometrica, 58, 525-542.
Epstein, L. and S. Zin, 1989, “Substitution, Risk Aversion, and the Temporal Behavior of Consumption and Asset Returns: A Theoretical Framework,” Econometrica, 57, 937-69.
Epstein, L. and S. Zin, 1991, “Substitution, Risk Aversion, and the Temporal Behavior of Consumption and Asset Returns: An Empirical Investigation,” Journal of Political Economy, 99, 263-268.
Fisher, M., and C. Gille, 1999, “Consumption and Asset Prices with Homothetic Recursive Preferences,” Working Paper 99-17, Federal Reserve Bank of Atlanta.
French, K. R., G. W. Schwert, and R. F. Stambaugh, 1987, “Expected Stock Returns and Volatility,” Journal of Financial Economics, 19, 3-29.
Giovannini, A., and P. Weil, 1991, “Risk Aversion and Intertemporal Substitution in the Capital Asset Pricing Model,” Working Paper 2824, NBER.
Glosten, L. R., R. Jagannathan, and D. Runkle, 1993, “On the Relation Between the Expected Value and the Volatility of the Nominal Excess Return on Stocks,” Journal of Finance, 48, 1779-1801.
Hall, R. E., 1988, “Intertemporal Substitution in Consumption,” Journal of Political Economy, 96, 339-357.
Harvey, C., 1991, “The World Price of Covariance Risk,” Journal of Finance, 46, 111-157.
Heston, S. L., 1993, “A Closed-Form Solution for Options with Stochastic Volatility with Applications to Bond and Currency Options,” Review of Financial Studies, 6, 327-43.
Jiang, G., and J. Knight, 2002, “Estimation of Continuous Time Stochastic Processes via the Empirical Characteristic Function,” Journal of Business and Economic Statistics, 20, 187-213.
Judd, K. L., 1998, Numerical Methods in Economics, MIT Press, Cambridge, MA.
Kim, T. S., and E. Omberg, 1996, “Dynamic Nonmyopic Portfolio Behavior,” Review of Financial Studies, 9, 141-161.
Liu, J., 2002, “Portfolio Selection in Stochastic Environment,” Working Paper, University of California Los Angeles.
Lynch, W. and P. Balduzzi, 2000, “Predictability and Transaction Costs: The Impact on Rebalancing Rules and Behavior,” Journal of Finance, 55, 2285-2309.
Merton, R. C., 1969, “Lifetime Portfolio Selection Under Uncertainty: The Continuous Time Case,” Review of Economics and Statistics, 51, 247-257.
Merton, R. C., 1971, “Optimum Consumption and Portfolio Rules in a Continuous-Time Model,” Journal of Economic Theory, 3, 373-413.
Merton, R. C., 1973, “An Intertemporal Capital Asset Pricing Model,” Econometrica, 41, 867-887.
Merton, R. C., 1990, Continuous Time Finance, Basil Blackwell, Cambridge, MA.

---

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

1401

<!-- Page:33 -->

Samuelson, P. A., 1969, "Lifetime Portfolio Selection by Dynamic Stochastic Programming," Review of Economics and Statistics, 51, 239-246.

Schroder, M., and C. Skiadas, 1999, "Optimal Consumption and Portfolio Selection with Stochastic Differential Utility," Journal of Economic Theory, 89, 68-126.

Schwert, G. W., 1989, "Why Does Stock Market Volatility Change Over Time?" Journal of Finance, 44, 1115-1153.

Shiller, R. J., 1989, Market Volatility, MIT Press, Cambridge, MA.

Singleton, K. J., 2001, "Estimation of Affine Asset Pricing Models Using the Empirical Characteristic Function," Journal of Econometrics, 102, 111-141.

Stein, E. M. and J. C. Stein, 1991, "Stock Price Distributions with Stochastic Volatility: An Analytic Approach," Review of Financial Studies, 4, 727-752.

Viceira, L. M., 2001, "Optimal Portfolio Choice for Long-Horizon Investors with Nontradable Labor Income," Journal of Finance, 56, 433-470.

Vissin-Jorgensen, A., 2002, "Limited Asset Market Participation and the Elasticity of Intertemporal Substitution," Journal of Political Economy, 110, 825-853.

Wachter, J., 2002, "Portfolio and Consumption Decisions Under Mean-Reverting Returns: An Exact Solution for Complete Markets," Journal of Financial and Quantitative Analysis, 37, 63-91.

Xia, Y., 2001, "Learning About Predictability: The Effects of Parameter Uncertainty on Dynamic Asset Allocation," Journal of Finance, 56, 205-246.

---

1402

This content downloaded from 132.239.1.231 on Sun, 18 Sep 2016 01:08:30 UTC All use subject to http://about.jstor.org/terms

<!-- Page:34 -->