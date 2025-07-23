---

<!-- Page:0 -->

# A Closed-Form Solution for Options with Stochastic Volatility with Applications to Bond and Currency Options

**Steven L. Heston<sup>1</sup> <sup>*</sup>**

<sup>1</sup> Yale University

<sup>*</sup>Corresponding author

<sup>☆</sup> I thank Hans Knoch for computational assistance. I am grateful for the suggestions of Hyeng Keun (the referee) and for comments by participants at a 1992 National Bureau of Economic Research seminar and the Queen's University 1992 Derivative Securities Symposium. Any remaining errors are my responsibility.

---

**Abstract**

I use a new technique to derive a closed-form solution for the price of a European call option on an asset with stochastic volatility. The model allows arbitrary correlation between volatility and spot asset returns. I introduce stochastic interest rates and show how to apply the model to bond options and foreign currency options. Simulations show that correlation between volatility and the spot asset's price is important for explaining return skewness and strike-price biases in the Black-Scholes (1973) model. The solution technique is based on characteristic functions and can be applied to other problems.

Many plaudits have been aptly used to describe Black and Scholes' (1973) contribution to option pricing theory. Despite subsequent development of option theory, the original Black-Scholes formula for a European call option remains the most successful and widely used application. This formula is particularly useful because it relates the distribution of spot returns

<!-- Page:1 -->

to the cross-sectional properties of option prices. In this article, I generalize the model while retaining this feature.

Although the Black-Scholes formula is often quite successful in explaining stock option prices [Black and Scholes (1972)], it does have known biases [Rubinstein (1985)]. Its performance also is substantially worse on foreign currency options [Melino and Turnbull (1990, 1991), Knoch (1992)]. This is not surprising, since the Black-Scholes model makes the strong assumption that (continuously compounded) stock returns are normally distributed with known mean and variance. Since the Black-Scholes formula does not depend on the mean spot return, it cannot be generalized by allowing the mean to vary. But the variance assumption is somewhat dubious. Motivated by this theoretical consideration, Scott (1987), Hull and White (1987), and Wiggins (1987) have generalized the model to allow stochastic volatility. Melino and Turnbull (1990, 1991) report that this approach is successful in explaining the prices of currency options. These papers have the disadvantage that their models do not have closed-form solutions and require extensive use of numerical techniques to solve two-dimensional partial differential equations. Jarrow and Eisenberg (1991) and Stein and Stein (1991) assume that volatility is uncorrelated with the spot asset and use an average of Black-Scholes formula values over different paths of volatility. But since this approach assumes that volatility is uncorrelated with spot returns, it cannot capture important skewness effects that arise from such correlation. I offer a model of stochastic volatility that is not based on the Black-Scholes formula. It provides a closed-form solution for the price of a European call option when the spot asset is correlated with volatility, and it adapts the model to incorporate stochastic interest rates. Thus, the model can be applied to bond options and currency options.

## 1. Stochastic Volatility Model

We begin by assuming that the spot asset at time $t$ follows the diffusion

$$
dS(t) = \mu S \, dt + \sqrt{v(t)} S \, dz_1(t), \tag{1}
$$

where $z_{1}(t)$ is a Wiener process. If the volatility follows an Ornstein-Uhlenbeck process [e.g., used by Stein and Stein (1991)],

$$
d\sqrt{v(t)} = -\beta\sqrt{v(t)}dt + \delta\ dz_2(t), \tag{2}
$$

then Ito's lemma shows that the variance $\nu(t)$ follows the process

---

328

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

<!-- Page:2 -->

$$
dv(t) = [\delta^2 - 2\beta v(t)]dt + 2\delta\sqrt{v(t)}dz_2(t). \tag{3}
$$

This can be written as the familiar square-root process [used by Cox, Ingersoll, and Ross (1985)]

$$
dv(t) = \kappa[\theta - v(t)]dt + \sigma\sqrt{v(t)}dz_2(t), \tag{4}
$$

where $z_{2}(t)$ has correlation $\pmb\rho$ with $z_{1}(t)$ . For simplicity at this stage, we assume a constant interest rate $\pmb{r}.$ Therefore, the price at time $t$ of a unit discount bond that matures at time $t+\tau$ is

$$
P(t, t + \tau) = e^{-\pi}. \tag{5}
$$

These assumptions are still insufficient to price contingent claims because we have not yet made an assumption that gives the “"price of volatility risk." Standard arbitrage arguments [Black and Scholes (1973), Merton (1973)] demonstrate that the value of any asset $U(S,$ $v,t)$ (including accrued payments) must satisfy the partial differential equation (PDE)

$$
\frac{1}{2} vS^2 \frac{\partial^2 U}{\partial S^2} + \rho \sigma vS \frac{\partial^2 U}{\partial S \partial v} + \frac{1}{2} \sigma^2 v \frac{\partial^2 U}{\partial v^2} + rS \frac{\partial U}{\partial S} + \left\{ \kappa [\theta - v(t)] - \lambda(S, v, t) \right\} \frac{\partial U}{\partial v} - rU + \frac{\partial U}{\partial t} = 0. \tag{6}
$$

The unspecified term $\lambda(S,\nu,t)$ represents the price of volatility risk, and must be independent of the particular asset. Lamoureux and Lastrapes (1993) present evidence that this term is nonzero for equity options. To motivate the choice of $\lambda(S,v,t)$ , we note that in Breeden's (1979) consumption-based model,

$$
\lambda(S, v, t) \, dt = \gamma \, \text{Cov}[dv, dC/C], \tag{7}
$$

where $C(t)$ is the consumption rate and $\gamma$ is the relative-risk aversion of an investor. Consider the consumption process that emerges in the (general equilibrium) Cox, Ingersoll, and Ross (1985) model

$$
dC(t) = \mu_c v(t) C \, dt + \sigma_c \sqrt{v(t)} C \, dz_3(t) \tag{8}
$$

where consumption growth has constant correlation with the spotasset return. This generates a risk premium proportional to $v,\lambda(S,\nu,$ $t)=\lambda v$ . Although we will use this form of the risk premium, the pricing results are obtained by arbitrage and do not depend on the other assumptions of the Breeden (1979) or Cox, Ingersoll, and Ross (1985) models. However, we note that the model is consistent with conditional heteroskedasticity in consumption growth as well as in asset returns. In theory, the parameter 入 could be determined by one

---

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

329

<!-- Page:3 -->

volatility-dependent asset and then used to price all other volatility. dependent assets.$^{1}$

A European call option with strike price $K$ and maturing at time $_T$ satisfies the PDE (6) subject to the following boundary conditions:

$$
U(S, v, T) = \max(0, S - K), \\ U(0, v, t) = 0, \\ \frac{\partial U}{\partial S}(\infty, v, t) = 1, \\ rS\frac{\partial U}{\partial S}(S, 0, t) + \kappa\theta\frac{\partial U}{\partial v}(S, 0, t) \\ - rU(S, 0, t) + U_t(S, 0, t) = 0, \\ U(S, \infty, t) = S. \tag{9}
$$

By analogy with the Black-Scholes formula, we guess a solution of the form

$$
C(S, v, t) = SP_1 - KP(t, T)P_2, \tag{10}
$$

where the first term is the present value of the spot asset upon optimal exercise, and the second term is the present value of the strike-price payment. Both of these terms must satisfy the original PDE (6). It is convenient to write them in terms of the logarithm of the spot price

$$
x = \ln[S]. \tag{11}
$$

Substituting the proposed solution (10) into the original PDE (6) shows that $P_{1}$ and $P_{2}$ must satisfy the PDEs

$$
\frac{1}{2} v \frac{\partial^2 P_j}{\partial x^2} + \rho \sigma v \frac{\partial^2 P_j}{\partial x \partial v} + \frac{1}{2} \sigma^2 v \frac{\partial^2 P_j}{\partial v^2} + (r + u_j v) \frac{\partial P_j}{\partial x}
$$

$$
+ (a_j - b_j v) \frac{\partial P^j}{\partial v} + \frac{\partial P^j}{\partial t} = 0 \tag{12}
$$

for $j=1,2$ , where

$$
u_1 = \tfrac{1}{2}, \quad u_2 = -\tfrac{1}{2}, \quad a = \kappa \theta, \quad b_1 = \kappa + \lambda - \rho \sigma, \quad b_2 = \kappa + \lambda.
$$

For the option price to satisfy the terminal condition in Equation (9), these PDEs (12) are subject to the terminal condition

$$
P_j(x,\, v,\, T; \ln[K]) = 1_{\{x \geq \ln[K]\}}. \tag{13}
$$

Thus, they may be interpreted as “adjusted" or “risk-neutralized" probabilities (See Cox and Ross (1976)). The Appendix explains that when $_{x}$ follows the stochastic process

---

This is analogous to extracting an implied volatility parameter in the Black-Scholes model.

330

<!-- Page:4 -->

$$
dx(t) = [r + u_j v]dt + \sqrt{v(t)} dz_1(t), \tag{14}
$$

where the parameters $u_{j},\alpha_{j},$ and $b_{j}$ are defined as before, then $P_{j}$ the conditional probability that the option expires in-the-money: 

$$
P_j(x, v, T; \ln[K]) = \Pr[x(T) \geq \ln[K] \mid x(t) = x, v(t) = v]. \tag{15}
$$

The probabilities are not immediately available in closed form. However, the Appendix shows that their characteristic functions, $f_{1}(x,~v,$ $T;\phi)$ and $f_{2}(x,\upsilon,T;\phi)$ respectively, satisfy the same PDEs (12), subject to the terminal condition 

$$
f_{j}(x, v, T; \phi) = e^{i \phi x}. \tag{16}
$$

The characteristic function solution is 

$$
f_{j}(x, v, t; \phi) = e^{C(T-t; \phi)} + D(T-t; \phi)v + t\phi x, \tag{17}
$$

where 

$$
C(\tau; \phi) = r\phi i\tau + \frac{a}{\sigma^2} \left\{ (b_j - \rho\sigma\phi i + d)\tau - 2 \ln \left[\frac{1 - ge^{d\tau}}{1 - g}\right] \right\},
$$

and 

$$
g = \frac{b_j - \rho \sigma \phi i + d}{b_j - \rho \sigma \phi i - d},
$$

One can invert the characteristic functions to get the desired probabilities: 

$$
P_{j}(x, v, T; \ln[K]) = \frac{1}{2} + \frac{1}{\pi} \int_{0}^{\infty} \text{Re}\left[\frac{e^{-i\phi \ln[K]}f_{j}(x, v, T; \phi)}{i\phi}\right] d\phi. \tag{18}
$$

The integrand in Equation (18) is a smooth function that decays rapidly and presents no difficulties.$^{2}$

Equations (10), (17), and (18) give the solution for European call options. In general, one cannot eliminate the integrals in Equation (18), even in the Black-Scholes case. However, they can be evaluated in a fraction of a second on a microcomputer by using approximations

---

Note that characteristic functions always exist; Kendall and Stuart (1977) establish that the integral converges.

<!-- Page:5 -->

similar to the standard ones used to evaluate cumulative normal prob. abilities.[^1] 

## 2. Bond Options, Currency Options, and Other Extensions

One can incorporate stochastic interest rates into the option pricing model, following Merton (1973) and Ingersoll (1990). In this manner, one can apply the model to options on bonds or on foreign currency. This section outlines these generalizations to show the broad applicability of the stochastic volatility model. These generalizations are equivalent to the model of the previous section, except that certain parameters become time-dependent to reflect the changing characteristics of bonds as they approach maturity.

To incorporate stochastic interest rates, we modify Equation (1) to allow time dependence in the volatility of the spot asset:

$$
dS(t) = \mu_s S \, dt + \sigma_s(t) \sqrt{v(t)} S \, dz_1(t). \tag{19}
$$

This equation is satisfied by discount bond prices in the Cox, Ingersoll, and Ross (1985) model and multiple-factor models of Heston (1990). Although the results of this section do not depend on the specific form of ${\mathbf{\sigma}}_{s},$ if the spot asset is a discount bond then ${\mathbf{\sigma}}_{s}$ must vanish at maturity in order for the bond price to reach par with probability 1. The specification of the drift term ${\mathbf{\mu}}_{s}$ is unimportant because it will not affect option prices. We specify analogous dynamics for the bond price:

$$
dP(t; T) = \mu_P P(t; T) dt + \sigma_P(t) \sqrt{v(t)} P(t; T) dz_2(t). \tag{20}
$$

Note that, for parsimony, we assume that the variances of both the spot asset and the bond are determined by the same variable $v(t)$ . In this model, the valuation equation is

$$
\begin{align} \sigma_s(t)^2 v S^2 \frac{\partial^2 U}{\partial S^2} + \frac{1}{2} \sigma_p^2(t) v P^2 \frac{\partial^2 U}{\partial P^2} + \frac{1}{2} \sigma^2 v \frac{\partial^2 U}{\partial v^2} \nonumber \\ + \rho_{SP} \sigma_s(t) \sigma_p(t) v S P \frac{\partial^2 U}{\partial S \partial P} + \rho_{Sv} \sigma_s(t) \sigma v S \frac{\partial^2 U}{\partial S \partial v} \nonumber \\ + \rho_{Pv} \sigma_p(t) \sigma v P \frac{\partial^2 U}{\partial P \partial v} + r S \frac{\partial U}{\partial S} + r P \frac{\partial U}{\partial P} \nonumber \\ + (\kappa [\theta - v(t)] - \lambda v) \frac{\partial U}{\partial v} - r U + \frac{\partial U}{\partial t} = 0, \tag{21} \end{align}
$$

---

Note that when evaluating multiple options with different strike options, one needs not recompute the characteristic functions when evaluating the integral in Equation (18).

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

[^1]: This equation is satisfied by discount bond prices in the Cox, Ingersoll, and Ross (1985) model and multiple-factor models of Heston (1990).

<!-- Page:6 -->

where $\pmb{\rho}_{x y}$ denotes the correlation between stochastic processes $_{x}$ and y. Proceeding with the substitution (10) exactly as in the previous section shows that the probabilities $P_{1}$ and $P_{2}$ must satisfy the PDE:

$$
\frac{1}{2} \sigma_{x}(t)^2 v \frac{\partial^2 P_{j}}{\partial x^2} + \rho_{xv}(t) \sigma_{x}(t) \sigma v \frac{\partial^2 P_{j}}{\partial x \partial v} + \frac{1}{2} \sigma^2 v \frac{\partial^2 P_{j}}{\partial v^2} + u_{j}(t) v \frac{\partial P_{j}}{\partial x} + (a_{j} - b_{j}(t) v) \frac{\partial P_{j}}{\partial v} + \frac{\partial P_{j}}{\partial t} = 0, \tag{22}
$$

for $j=1,2$ , where

$$
x = \ln\left[\frac{S}{P(t; T)}\right],
$$

Note that Equation (22) is equivalent to Equation (12) with some time-dependent coefficients. The availability of closed-form solutions to Equation (22) will depend on the particular term structure model [e.g., the specification of $\pmb{\sigma}_{\pmb{x}}(t)]$ . In any case, the method used in the Appendix shows that the characteristic function takes the form of Equation (17), where the functions $C(\tau)$ and $D(\tau)$ satisfy certain ordinary differential equations. The option price is then determined by Equation (18). while the functions $C(\tau)$ and $D(\tau)$ may not have closed-form solutions for some term structure models, this represents an enormous reduction compared to solving Equation (21) numerically.

One can also apply the model when the spot asset $S(t)$ is the dollar price of foreign currency. We assume that the foreign price of a foreign discount bond, $F(t;T)$ , follows dynamics analogous to the domestic bond in Equation (20):

$$
dF(t; T) = \mu_p F(t; T) dt + \sigma_p(t) \sqrt{v(t)} F(t; T) dz_2(t) \tag{23}
$$

For clarity, we denote the domestic interest rate by $r_{D}$ and the foreign interest rate by $r_{F}.$ Following the arguments in Ingersoll (1990), the valuation equation is

---

333

<!-- Page:7 -->

$$
\begin{align} \frac{1}{2} \sigma_S(t)^2 vS^2 \frac{\partial^2 U}{\partial S^2} + \frac{1}{2} \sigma_P(t)^2 vP^2 \frac{\partial^2 U}{\partial P^2} + \frac{1}{2} \sigma_F(t)^2 vF^2 \frac{\partial^2 U}{\partial F^2} + \frac{1}{2} \sigma_v^2 v \frac{\partial^2 U}{\partial v^2} \nonumber \\ + \rho_{SP} \sigma_S(t) \sigma_P(t) vSP \frac{\partial^2 U}{\partial S \partial P} + \rho_{SP} \sigma_S(t) \sigma_F(t) vSF \frac{\partial^2 U}{\partial S \partial F} \nonumber \\ + \rho_{SP} \sigma_P(t) \sigma_F(t) vPF \frac{\partial^2 U}{\partial P \partial F} + \rho_{Sv} \sigma_S(t) \sigma vS \frac{\partial^2 U}{\partial S \partial v} \nonumber \\ + \rho_{Pv} \sigma_P(t) \sigma vP \frac{\partial^2 U}{\partial P \partial v} + \rho_{Fv} \sigma_F(t) \sigma vF \frac{\partial^2 U}{\partial F \partial v} + r_D S \frac{\partial U}{\partial S} + r_D P \frac{\partial U}{\partial P} \nonumber \\ + r_F F \frac{\partial U}{\partial F} + (\kappa [\theta - v(t)] - \lambda v) \frac{\partial U}{\partial v} - rU + \frac{\partial U}{\partial t} = 0. \tag{24} \end{align}
$$

Solving this five-variable PDE numerically would be completely infeasible. But one can use Garmen and Kohlhagen's (1983) substitution analogous to Equation (10):

$$
C(S, v, t) = SF(t, T)P_1 - KP(t, T)P_2. \tag{25}
$$

Probabilities $P_{1}$ and $P_{2}$ must satisfy the PDE

$$
\frac{1}{2} \sigma_x(t)^2 v \frac{\partial^2 P_j}{\partial x^2} + \rho_{xv}(t) \sigma_x(t) \sigma v \frac{\partial^2 P_j}{\partial x \partial v} + \frac{1}{2} \sigma^2 v \frac{\partial^2 P_j}{\partial v^2} + u_j(t) v \frac{\partial P_j}{\partial x} + (a_j - b_j(t) v) \frac{\partial P_j}{\partial v} + \frac{\partial P_j}{\partial t} = 0 \tag{26}
$$

for $j=1,2$ , where

$$
x = \ln\left[\frac{SF(t,T')}{P(t,T)}\right],
$$

Once again, the characteristic function has the form of Equation (17), where $C(\tau)$ and $D(\tau)$ depend on the specification of $\pmb{\sigma}_{x}(t),\pmb{\rho}_{x\nu}(t)$ ,and $b_{j}(t)$ (see the Appendix).

---

334

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

<!-- Page:8 -->

Although the stochastic interest rate models of this section are tractable, they would be more complicated to estimate than the simpler model of the previous section. For short-maturity options on equities, any increase in accuracy would likely be outweighed by the estimation error introduced by implementing a more complicated model. As option maturities extend beyond one year, however, the interest rate effects can become more important$^{1}$. The more complicated models illustrate how the stochastic volatility model can be adapted to a variety of applications. For example, one could value U.s. options by adding on the early exercise approximation of Barone-Adesi and whalley (1987). The solution technique has other applications, too. See the Appendix for application to Stein and Stein's (1991) mode1 (with correlated volatility) and see Bates (1992) for application to jump-diffusion processes.

## 3. Effects of the Stochastic Volatility Model Options Prices

In this section, I examine the effects of stochastic volatility on options prices and contrast results with the Black-Scholes model. Many effects are related to the time-series dynamics of volatility. For example, a higher variance $\nu(t)$ raises the prices of all options, just as it does in the Black-Scholes model. In the risk-neutralized pricing probabilities, the variance follows a square-root process

$$
dv(t) = \kappa^* [\theta^* - v(t)] dt + \sigma \sqrt{v(t)} \, dz_2(t) \tag{27}
$$

where

$$
\kappa^{*} = \kappa + \lambda \quad \text{and} \quad \theta^{*} = \kappa \theta / (\kappa + \lambda).
$$

We analyze the model in terms of this risk-neutralized volatility process instead of the "true" process of Equation (4), because the riskneutralized process exclusively determines prices. The variance drifts toward a long-run mean of ${\theta}^{*}$, with mean-reversion speed determined by $\kappa^{*}$. Hence, an increase in the average variance ${\theta}^{*}$ increases the prices of options. The mean reversion then determines the relative weights of the current variance and the long-run variance on option prices. When mean reversion is positive, the variance has a steadystate distribution [Cox, Ingersoll, and Ross (1985)] with mean ${\theta}^{*}$. Therefore, spot returns over long periods will have asymptotically normal distributions, with variance per unit of time given by ${\theta}^{*}$. Consequently, the Black-Scholes model should tend to work well for long-term options. However, it is important to realize that the

---

4 This occurs for exactly the same reason that the Black-Scholes formula does not depend on the mean stock return. See Heston(1992) for a theoretical analysis that explains when parameters drop out of option prices.

<!-- Page:9 -->

$$
dS(t) = \mu S \, dt + \sqrt{v(t)} S \, dz_1(t), \tag{10}
$$

<center><i>Table 1 Default parameters for simulation of option prices </i></center>

| Parameter | Value |
|---|---|
| Mean reversion | $\kappa^* = 2$ |
| Long-run variance | $\theta^* = .01$ |
| Current variance | $v(t) = .01$ |
| Correlation of $z_1(t)$ and $z_2(t)$ | $\rho = 0.$ |
| Volatility of volatility parameter | $\sigma = .1$ |
| Option maturity | .5 year |
| Interest rate | $r = 0$ |
| Strike price | $K = 100$ |

implied variance $\theta^{*}$ from option prices may not equal the variance of spot returns given by the “true' process (4). This difference is caused by the risk premium associated with exposure to volatility changes. As Equation (27) shows, whether ${\pmb\theta}^{*}$ is larger or smaller than the true average variance $\pmb\theta$ depends on the sign of the risk-premium parameter $\lambda$. One could estimate $\pmb{\theta}^{*}$ and other parameters by using values implied by option prices. Alternatively, one could estimate $\pmb\theta$ and $\pmb{K}$ from the true spot-price process. One could then estimate the risk-premium parameter $\pmb{\lambda}$ by using average returns on option positions that are hedged against the risk of changes in the spot asset.

The stochastic volatility model can conveniently explain properties of option prices in terms of the underlying distribution of spot returns. Indeed, this is the intuitive interpretation of the solution (10), since $P_{2}$ corresponds to the risk-neutralized probability that the option expires in-the-money. To illustrate effects on options prices, we shall use the default parameters in Table 1. For comparison, we shall use the Black-Scholes model with a volatility parameter that matches the (square root of the) variance of the spot return over the life of the option. This normalization focuses attention on the effects of stochastic volatility on one option relative to another by equalizing “average' option model prices across different spot prices. The correlation parameter $\pmb\rho$ positively affects the skewness of spot returns. Intuitively, a positive correlation results in high variance when the spot asset rises, and this “spreads' the right tail of the probability density. Conversely, the left tail is associated with low variance and is not spread out. Figure 1 shows how a positive correlation of volatility with the spot return creates a fat right tail and a thin left tail in the

---

5 These parameters roughly correspond to Knoch's (1992) estimates with yen and deutsche mark currency options,assuming no-risk premium associated with volatility. However, the mean-reversion parameter is chosen to be more reasonable. 6 This variance can be determined by using the characteristic function.

336

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

<!-- Page:10 -->

<center><i>Figure 1: Conditional probability density of the continuously compounded spot return over a six-month horizon. Spot-asset dynamics are <img src="https://latex.codecogs.com/svg.image?d%20S(t)=\mu%20S%20d%20t%2B\sqrt{\nu(t)}S%20d%20z_{1}(t)" style="vertical-align: middle; height: 1.2em;" alt="d S(t)=\mu S d t+\sqrt{\nu(t)}S d z_{1}(t)" class="latex-formula"/> where <img src="https://latex.codecogs.com/svg.image?d\upsilon(t)=\kappa^{\ast}[\theta^{\ast}-\upsilon(t)]d%20t%2B\sigma\sqrt{\upsilon(t)}d%20z_{2}(t)" style="vertical-align: middle; height: 1.2em;" alt="d\upsilon(t)=\kappa^{\ast}[\theta^{\ast}-\upsilon(t)]d t+\sigma\sqrt{\upsilon(t)}d z_{2}(t)" class="latex-formula"/>. Except for the correlation <img src="https://latex.codecogs.com/svg.image?\pmb\rho" style="vertical-align: middle; height: 1.2em;" alt="\pmb\rho" class="latex-formula"/> between <img src="https://latex.codecogs.com/svg.image?{\boldsymbol{z}}_{1}" style="vertical-align: middle; height: 1.2em;" alt="{\boldsymbol{z}}_{1}" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?z_{2}" style="vertical-align: middle; height: 1.2em;" alt="z_{2}" class="latex-formula"/> shown, parameter values are shown in Table 1. For comparison, the probability densities are normalized to have zero mean and unit variance.</i></center>

<div align="center">
  <img src="images/3f4074637f6a69b81c4258ea100f2e722e0b14fd7f76b69d9518ae9482d033b6.jpg" style="max-width: 70%;" />
</div>

### Price Difference ($)

<center><i>Figure 2: Option prices from the stochastic volatility model minus Black-Scholes values with equal volatility to option maturity. Except for the correlation <img src="https://latex.codecogs.com/svg.image?{\pmb\rho}" style="vertical-align: middle; height: 1.2em;" alt="{\pmb\rho}" class="latex-formula"/> between <img src="https://latex.codecogs.com/svg.image?z_{1}" style="vertical-align: middle; height: 1.2em;" alt="z_{1}" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?z_{2}" style="vertical-align: middle; height: 1.2em;" alt="z_{2}" class="latex-formula"/> shown, parameter values are shown in Table 1. When <img src="https://latex.codecogs.com/svg.image?{\pmb\rho}=-.5" style="vertical-align: middle; height: 1.2em;" alt="{\pmb\rho}=-.5" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?{\pmb\rho}=.5" style="vertical-align: middle; height: 1.2em;" alt="{\pmb\rho}=.5" class="latex-formula"/>, respectively, the Black-Scholes volatilities are 7.10 percent and 7.04 percent, and at-the-money option values are <img src="https://latex.codecogs.com/svg.image?\" style="vertical-align: middle; height: 1.2em;" alt="\" class="latex-formula"/>2.83<img src="https://latex.codecogs.com/svg.image?%20and%20" style="vertical-align: middle; height: 1.2em;" alt=" and " class="latex-formula"/>\<img src="https://latex.codecogs.com/svg.image?2.81" style="vertical-align: middle; height: 1.2em;" alt="2.81" class="latex-formula"/></i></center>

<div align="center">
  <img src="images/1c83a95f0ba1a11353791bdde76c9aa2db203ab297a034f375e348710d1f2348.jpg" style="max-width: 70%;" />
</div>

---

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

337

<!-- Page:11 -->

distribution of continuously compounded spot returns.[^1] Figure 2 shows that this increases the prices of out-of-the-money options and decreases the prices of in-the-money options relative to the Black-Scholes model with comparable volatility. Intuitively, out-of-the-money call options benefit substantially from a fat right tail and pay little penalty for an increased probability of an average or slightly below average spot return. A negative correlation has completely opposite effects. It decreases the prices of out-of-the-money options relative to in-the-money options.

The parameter $\pmb{\sigma}$ controls the volatility of volatility. When $\pmb{\sigma}$ is zero, the volatility is deterministic, and continuously compounded spot returns have a normal distribution. Otherwise, $\pmb{\sigma}$ increases the kurtosis of spot returns. Figure 3 shows how this creates two fat tails in the distribution of spot returns. As Figure 4 shows, this has the effect of raising far-in-the-money and far-out-of-the-money option prices and lowering near-the-money prices. Note, however, that there is little effect on skewness or on the overall pricing of in-the-money options relative to out-of-the-money options.

These simulations show that the stochastic volatility model can

<center><i>Figure3 Conditional probability density of the continuously compounded spot return over a sixmonthhorizon Spot-assetdynamicsare <img src="https://latex.codecogs.com/svg.image?d%20S(t)=\mu%20S%20d%20t%2B\sqrt{\nu(t)}S%20d%20z_{1}(t)" style="vertical-align: middle; height: 1.2em;" alt="d S(t)=\mu S d t+\sqrt{\nu(t)}S d z_{1}(t)" class="latex-formula"/> where <img src="https://latex.codecogs.com/svg.image?d\upsilon(t)=\kappa^{\ast}[\theta^{\ast}-\upsilon(t)]d%20t%2B\sigma\sqrt{\upsilon(t)}d%20z_{2}(t)" style="vertical-align: middle; height: 1.2em;" alt="d\upsilon(t)=\kappa^{\ast}[\theta^{\ast}-\upsilon(t)]d t+\sigma\sqrt{\upsilon(t)}d z_{2}(t)" class="latex-formula"/> Exceptforthevolatility ofvolatilityparameter <img src="https://latex.codecogs.com/svg.image?\pmb{\sigma}" style="vertical-align: middle; height: 1.2em;" alt="\pmb{\sigma}" class="latex-formula"/> shown,parameter values are shown in Table 1. For comparison, the probability densities are normalized to have zero mean and unit variance.</i></center>

<div align="center">
  <img src="images/b966f56ee7a87beacf75aa82b4ca740ab49e323047b930b6908e86a1b547a0ee.jpg" style="max-width: 70%;" />
</div>

---

rhis illustration is motivated by Jarrow and Rudd (1982) and Hull (1989)

338

[^1]: This illustration is motivated by Jarrow and Rudd (1982) and Hull (1989)

<!-- Page:12 -->

<center><i>Figure 4: Option prices from the stochastic volatility model minus Black-Scholes values with equal volatility to option maturity. Except for the volatility of volatility parameter <img src="https://latex.codecogs.com/svg.image?\pmb{\sigma}" style="vertical-align: middle; height: 1.2em;" alt="\pmb{\sigma}" class="latex-formula"/> shown, parameter values are shown in Table 1. In both curves, the Black-Scholes volatility is 7.07 percent and the at-the-money option value is <img src="https://latex.codecogs.com/svg.image?\" style="vertical-align: middle; height: 1.2em;" alt="\" class="latex-formula"/>2.82$</i></center>

<div align="center">
  <img src="images/beac1c13bb233b5567c2d28ed05d703c3c3ac6fcea7c7a47826fa6625206391c.jpg" style="max-width: 70%;" />
</div>

produce a rich variety of pricing effects compared with the Black-Scholes model. The effects just illustrated assumed that variance was at its long-run mean, ${\pmb\theta}^{*}$. In practice, the stochastic variance will drift above and below this level, but the basic conclusions should not change. An important insight from the analysis is the distinction between the effects of stochastic volatility per se and the effects of correlation of volatility with the spot return. If volatility is uncorrelated with the spot return, then increasing the volatility of volatility $(\pmb{\sigma})$ increases the kurtosis of spot returns, not the skewness. In this case, random volatility is associated with increases in the prices of far-from-the-money options relative to near-the-money options. In contrast, the correlation of volatility with the spot return produces skewness. And positive skewness is associated with increases in the prices of out-of-the-money options relative to in-the-money options. Therefore, it is essential to choose properly the correlation of volatility with spot returns as well as the volatility of volatility.

## 4. Conclusions

I present a closed-form solution for options on assets with stochastic volatility. The model is versatile enough to describe stock options, bond options, and currency options. As the figures illustrate, the model can impart almost any type of bias to option prices. In particular, it links these biases to the dynamics of the spot price and the distribution of spot returns. Conceptually, one can characterize the

---

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

339

<!-- Page:13 -->

option models in terms of the first four moments of the spot return (under the risk-neutral probabilities). The Black-Scholes (1973) model shows that the mean spot return does not affect option prices at all, while variance has a substantial effect. Therefore, the pricing analysis of this article controls for the variance when comparing option models with different skewness and kurtosis. The Black-Scholes formula produces option prices virtually identical to the stochastic volatility models for at-the-money options. One could interpret this as saying that the Black-Scholes model performs quite well. Alternatively, all option models with the same volatility are equivalent for at-the-money options. Since options are usually traded near-the-money, this explains some of the empirical support for the Black-Scholes model. Correlation between volatility and the spot price is necessary to generate skewness. Skewness in the distribution of spot returns affects the pricing of in-the-money options relative to.out-of-the money options. Without this correlation, stochastic volatility only changes the kurtosis. Kurtosis affects the pricing of near-the-money versus farfrom-the-money options. 

With proper choice of parameters, the stochastic volatility model appears to be a very flexible and promising description of option prices. It presents a number of testable restrictions, since it relates option pricing biases to the dynamics of spot prices and the distribution of spot returns. Knoch (1992) has successfully used the model to explain currency option prices. The model may eventually explain other option phenomena. For example, Rubinstein (1985) found option biases that changed through time. There is also some evidence that implied volatilities from options prices do not seem properly related to future volatility. The model makes it feasible to examine these puzzles and to investigate other features of option pricing. Finally, the solution technique itself can be applied to other problems and is not limited to stochastic volatility or diffusion problems. 

## Appendix: Derivation of the Characteristic Functions 

This appendix derives the characteristic functions in Equation (17) and shows how to apply the solution technique to other valuation problems. Suppose that $x(t)$ and $\nu(t)$ follow the (risk-neutral) processes in Equation (15). Consider any twice-differentiable function $f(x,~\nu,~t)$ that is a conditional expectation of some function of $_{x}$ and $\pmb{\nu}$ at a later date, $T,g(x(T),\nu(T))$

$$
f(x, v, t) = E[g(x(T), v(T)) \mid x(t) = x, v(t) = v]. \tag{A1}
$$

---

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

<!-- Page:14 -->

Ito's lemma shows that

$$
df=\left(\frac{1}{2}v\frac{\partial^{2}f}{\partial x^{2}}+\rho\sigma v\frac{\partial^{2}f}{\partial x\,\partial v}+\frac{1}{2}\sigma^{2}v\frac{\partial^{2}f}{\partial v^{2}}+(r+u_{j}v)\frac{\partial f}{\partial x}\right.
$$

By iterated expectations, we know that $f$ must be a martingale:

$$
E[df] = 0. \tag{A3}
$$

Applying this to Equation (A2) yields the Fokker-Planck forward equation:

$$
\frac{1}{2} v \frac{\partial^2 f}{\partial x^2} + \rho \sigma v \frac{\partial^2 f}{\partial x \partial v} + \frac{1}{2} \sigma^2 v \frac{\partial^2 f}{\partial v^2} + (r + u_j v) \frac{\partial f}{\partial x} + (a - b_j v) \frac{\partial f}{\partial v} + \frac{\partial f}{\partial t} = 0 \tag{A4}
$$

[see Karlin and Taylor (1975) for more details]. Equation (A1) imposes the terminal condition

$$
f(x, v, T) = g(x, v). \tag{A5}
$$

This equation has many uses. If $g(x,\nu)=\delta(x-x_{0})$ , then the solution is the conditional probability density at time $t$ that $x(T)=x_{0}$ . And if $g(x,\nu)=1_{\{x\geq\ln[K]\}}$ , then the solution is the conditional probability at time $t$ that $x(T)$ is greater than $\ln[K]$ . Finally, if $g(x,\nu)=e^{i\phi x} $ then the solution is the characteristic function. For properties of characteristic functions, see Feller (1966) or Johnson and Kotz (1970).

To solve for the characteristic function explicitly, we guess the functional form

$$
f(x, v, t) = \exp[C(T - t) + D(T - t)v + i\phi x]. \tag{A6}
$$

This "guess" exploits the linearity of the coefficients in the PDE (A2). Following Ingersoll (1989, p. 397), one can substitute this functional form into the PDE (A2) to reduce it to two ordinary differential equations,

$$
-\frac{1}{2}\sigma^2\phi^2 + \rho\sigma\phi iD + \frac{1}{2}D^2 + u_j\phi i - b_jD + \frac{\partial D}{\partial t} = 0, \\ r\phi i + aD + \frac{\partial C}{\partial t} = 0 \tag{A7}
$$

---

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms

341

<!-- Page:15 -->

subject to 

$$
C(0) = 0, \quad D(0) = 0.
$$

These equations can be solved to produce the solution in the text. One can apply the solution technique of this article to other problems in which the characteristic functions are known. For example. Stein and Stein (1991) specify a stochastic volatility model of the form 

$$
d\sqrt{v(t)} = [\alpha - \beta\sqrt{v(t)}]\,dt + \delta\,dz_2(t), \tag{A8}
$$

From Ito's lemma, the process for the variance is 

$$
dv(t) = [\delta^2 + 2\alpha\sqrt{v} - 2\beta v] dt + 2\delta\sqrt{v(t)} dz_2(t). \tag{A9}
$$

Although Stein and Stein (1991) assume that the volatility process is uncorrelated with the spot asset, one can generalize this to allow $z_{1}(t)$ and $z_{2}(t)$ to have constant correlation. The solution method of this article applies directly, except that the characteristic functions take the form 

$$
f_{j}(x, v, t; \phi) = \exp[C(T - t) + D(T - t)v + E(T - t)\sqrt{v + \phi x}] \tag{A10}
$$

Bates (1992) provides additional applications of the solution technique to mixed jump-diffusion processes. 

## References 

---

Barone-Adesi, G., and R. E. Whalley, 1987, “Efcient Analytic Approximation of American Option Values," Journal of Finance, 42, 301-320. Bates, D. S., 1992,“Jumps and Stochastic Processes Implicit in PHLX Foreign Currency Options," working paper, Wharton School, University of Pennsylvania. Black, F., and M. Scholes, 1972, "The Valuation of Option Contracts and a Test of Market Efciency," Journal ofFinance,27,399-417. Black, F., and M. Scholes, 1973, "The Valuation of Options and Corporate Liabilities," Journal of PoliticalEconomy,81,637-654. Breeden, D. T., 1979, "An Intertemporal Asset Pricing Model with Stochastic Consumption and InvestmentOpportunities,"Journal ofFinancialEconomics,7,265-296. Cox, J. C., J. E. Ingersoll, and S. A. Ross, 1985, "A Theory of the Term Structure of Interest Rates," Econometrica,53,385-408. Cox, J. C., and S. A. Ross, 1976,“The Valuation of Options for Alternative Stochastic Processes," Journal ofFinancial Economics,3,145-166. Eisenberg, L. K., and R. A. Jarrow, 1991, "Option Pricing with Random Volatilities in Complete Markets,” Federal Reserve Bank of Atlanta Working Paper 91-16. Feller, W., 1966, An Introduction to Probability Tbeory and Its Applications (Vol. 2), Wiley, New York. 

342 

This content downloaded from 137.189.171.235 on Mon, 11 Jul 2016 10:30:32 UTC All use subject to http://about.jstor.org/terms 

<!-- Page:16 -->

Garman, M. B., and S. W. Kohlhagen, 1983, "Foreign Currency Option Values," Journal of International Money and Finance, 2, 231-237.

Heston, S. L., 1990, "Testing Continuous Time Models of the Term Structure of Interest Rates," Ph.D. Dissertation, Carnegie Mellon University Graduate School of Industrial Administration.

Heston, S. L., 1992, "Invisible Parameters in Option Prices," working paper, Yale School of Organization and Management.

Hull, J. C., 1989, Options, Futures, and Other Derivative Instruments, Prentice-Hall, Englewood Cliffs, N.J.

Hull, J. C., and A. White, 1987, "The Pricing of Options on Assets with Stochastic Volatilities," Journal of Finance, 42, 281-300.

Ingersoll, J. E., 1989, Theory of Financial Decision Making, Rowman and Littlefield, Totowa, N.J.

Ingersoll, J. E., 1990, "Contingent Foreign Exchange Contracts with Stochastic Interest Rates," working paper, Yale School of Organization and Management.

Jarrow, R., and A. Rudd, 1982, "Approximate Option Valuation for Arbitrary Stochastic Processes," Journal of Financial Economics, 10, 347-369.

Johnson, N. L., and S. Kotz, 1970, Continuous Univariate Distributions, Houghton Miflin, Boston.

Karlin, S., and H. M. Taylor, 1975, A First Course in Stochastic Processes, Academic, New York.

Kendall, M., and A. Stuart, 1977, The Advanced Theory of Statistics (Vol. 1), Macmillan, New York.

Knoch, H. J., 1992, "The Pricing of Foreign Currency Options with Stochastic Volatility," Ph.D. Dissertation, Yale School of Organization and Management.

Lamoureux, C. G., and W. D. Lastrapes, 1993, "Forecasting Stock-Return Variance: Toward an Understanding of Stochastic Implied Volatilities," Review of Financial Studies, 6, 293-326.

Melino, A., and S. Turnbull, 1990, "The Pricing of Foreign Currency Options with Stochastic Volatility," Journal of Econometrics, 45, 239-265.

Melino, A., and S. Turnbull, 1991, "The Pricing of Foreign Currency Options," Canadian Journal of Economics, 24, 251-281.

Merton, R. C., 1973, "Theory of Rational Option Pricing," Bell Journal of Economics and Management Science, 4, 141-183.

Rubinstein, M., 1985, "Nonparametric Tests of Alternative Option Pricing Models Using All Reported Trades and Quotes on the 30 Most Active CBOE Option Classes from August 23, 1976 through August 31, 1978," Journal of Finance, 40, 455-480.

Scott, L. O., 1987, "Option Pricing When the Variance Changes Randomly: Theory, Estimation, and an Application," Journal of Financial and Quantitative Analysis, 22, 419-438.

Stein, E. M., and J. C. Stein, 1991, "Stock Price Distributions with Stochastic Volatility: An Analytic Approach," Review of Financial Studies, 4, 727-752.

Wiggins, J. B., 1987, "Option Values under Stochastic Volatilities," Journal of Financial Economics, 19, 351-372.

<!-- Page:17 -->