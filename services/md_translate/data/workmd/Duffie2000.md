<!-- Page:0 -->

# TRANSFORM ANALYSIS AND ASSET PRICING FOR AFFINE JUMP-DIFFUSIONS

**DARRELL DUFFIE<sup>1</sup>, JUN PAN<sup>1</sup>, KENNETH SINGLETON<sup>1</sup>**

<sup>1</sup> Stanford University

<sup>☆</sup> We are grateful for extensive discussions with Jun Liu; conversations with Jean Jacod, Monika Piazzesi, Philip Protter, and Ruth Williams; helpful suggestions by anonymous referees and the editor; and support from the Financial Research Initiative, The Stanford Program in Finance, and the Gifford Fong Associates Fund at the Graduate School of Business, Stanford University.

---

**Abstract**

In the setting of “affine” jump-diffusion state processes, this paper provides an analytical treatment of a class of transforms, including various Laplace and Fourier transforms as special cases, that allow an analytical treatment of a range of valuation and econometric problems. Example applications include fixed-income pricing models, with a role for intensity-based models of default, as well as a wide range of option-pricing applications. An illustrative example examines the implications of stochastic volatility and jumps for option valuation. This example highlights the impact on option‘smirks’ of the joint distribution of jumps in volatility and jumps in the underlying asset price, through both jump amplitude as well as jump timing.

**Keywords**: Affine jump diffusions, option pricing, stochastic volatility, Fourier transform

## 1. INTRODUCTION

IN VALUING FINANCIAL SECURITIES in an arbitrage-free environment, One inevitably faces a trade-off between the analytical and computational tractability of pricing and estimation, and the complexity of the probability model for the statevector $X$ . In light of this trade-off, academics and practitioners alike have found it convenient to impose sufficient structure on the conditional distribution Oof $X$ to give closed- or nearly closed-form expressions for securities prices. An assumption that has proved to be particularly fruitful in developing tractable, dynamic asset pricing models is that $X$ follows an affine jump-diffusion ( AJD), which is, roughly speaking, a jump-diffusion process for which the drift vector, "instantaneous" covariance matrix, and jump intensities all have affine dependence on the state vector. Prominent among AJD models in the term-structure literature are the Gaussian and square-root diffusion models of Vasicek (1977) and Cox, Ingersoll, and Ross (1985). In the case of option pricing, there is a substantial literature building on the particular affine stochastic-volatility model for currency and equity prices proposed by Heston (1993).

This paper synthesizes and significantly extends the literature on affine asset-pricing models by deriving a closed-form expression for an "extended transform' of an AJD process $X$ , and then showing that this transform leads to analytically tractable pricing relations for a wide variety of valuation problems. More precisely, fixing the current date $t$ and a future payoff date $T$ ,suppose

<!-- Page:1 -->

that the stochastic “discount rate" $R(X_{t})$ , for computing present values of future cash flows, is an affine function of $X_{t}$ . Also, consider the generalized terminal payoff function $(v_{0}+v_{1}\cdot X_{T})e^{u\cdot X_{T}}$ of $X_{T}$ , where $v_{0}$ is scalar and the $n$ elements of each of $v_{1}$ and $u$ are scalars. These scalars may be real, or more generally, complex. We derive a closed-form expression for the transform

$$
E_t\left(\exp\left(-\int_t^T R(X_s, s)ds\right)(v_0 + v_1 \cdot X_T)e^{\mu \cdot X_T}\right), \tag{1.1}
$$

where $E_{t}$ denotes expectation conditioned on the history of $X$ up to $t$ . Then, using this transform, we show that the tractability offered by extant, specialized affine pricing models extends to the entire family of AJDs. Additionally, by selectively choosing the payoff $(v_{0}+v_{1}\cdot X_{T})e^{u\cdot X_{T}}$ , we significantly extend the set of pricing problems (security payoffs) that can be tractably addressed with $X$ following an AJD. To motivate the usefulness of our extended transform in theoretical and empirical analyses of affine models, we briefy outline three applications.

### 1.1. Affine, Defaultable Term Structure Models

There is a large literature on the term structure of default-free bond yields that presumes that the state vector underlying interest rate movements follows an AJD under risk-neutral probabilities (see, for example, Dai and Singleton (1999) and the references therein). Assuming that the instantaneous riskless short-term rate $r_{t}$ is affine with respect to an $n$ -dimensional AJD process $X_{t}$ (that is $\boldsymbol{r}_{t}=\boldsymbol{\rho}_{0}+\boldsymbol{\rho}_{1}\cdot\boldsymbol{X}_{t})$ Duffie and Kan (1996) show that the $(T-t)$ -period zero-coupon bond price,

$$
E\left(\exp\left(-\int_{t}^{T}r_{s}\,ds\right)\middle|X_{t}\right), \tag{1.2}
$$

is known in closed form, where expectations are computed under the risk. neutral measure.

Recently, considerable attention has been focused on extending these models to allow for the possibility of default in order to price corporate bonds and other credit-sensitive instruments. To illustrate the new pricing issues that may arise with the possibility of default, suppose that, with respect to given risk-neutral probabilities, $X$ is an AJD; the arrival of default is at a stochastic intensity $\lambda_{\iota}$ and upon default the holder recovers a constant fraction $w$ of face value. Then, from results in Lando (1998), the initial price of a $T$ -period zero-coupon bond is

---

2The entire class of affne term structure models is obtained as the special case of (1.1) found by setting $R(X_{t})=r_{t}$ $u=0$ $v_{0}=1$ ,and $v_{1}=0$ 3See, for example, Jarrow, Lando, and Turnbull (1997) and Duffe and Singleton (1999).

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject tohttp://about.jstor.org/terms

<!-- Page:2 -->

given under technical conditions by

$$
E\left(\exp\left(-\int_0^T (r_t + \lambda_t) dt\right)\right) + w \int_0^T q_t dt \tag{1.3}
$$

where $q_{t}=E[\lambda_{t}\mathrm{exp}(-\int_{0}^{t}(r_{u}+\lambda_{u})d u)]$ . The first term in (1.3) is the value of a claim that pays 1 contingent on survival to maturity $T$ We may view $q_{t}$ as the price density of a claim that pays 1 if default occurs in the “interval" $(t,t+d t)$ Thus.the second term in (1.3) is the price of any proceeds from default before $T$ These expectations are to be taken with respect to the given risk-neutral probabilities. Both the first term of (1.3) and, for each $t$ , the price density $q_{t}$ can be computed in closed form using our extended transform. Specifically, assuming that both $r_{t}$ and $\lambda_{t}$ are affine with respect to $X_{t}$ , the first term in (1.3) is the special case of (1.1) obtained by letting $R(X_{t})=r_{t}+\lambda_{t},u=0,v_{0}=1,$ and $v_{1}=0$ Similarly, $q_{t}$ is obtained as a special case of (1.1) by setting $u=0,R(X_{t})=r_{t}+\lambda_{t}$ , and $v_{0}+v_{1}\cdot X_{t}=\lambda_{t}$ . Thus, using our extended transform, the pricing of defaultable zero-coupon bonds with constant fractional recovery of par reduces to the computation of a one-dimensional integral of a known function. Similar reasoning can be used to derive closed-form expressions for bond prices in environments for which the default arrival intensity is affine in $X$ along with “gapping” risk associated with unpredictable transitions to different credit categories, as shown by Lando (1998).

A different application of the extended transform is pursued by Piazzesi (1998), who extends the AJD model in order to treat term-structure models with releases of macroeconomic information and with central-bank interest-rate targeting. She considers jumps at both random and at deterministic times, and allows for an intensity process and interest-rate process that have linear-quadratic dependence on the underlying state vector, extending the basic results of this paper.

### 1.2. Estimation of Affine Asset Pricing Models

Another useful implication of (1.1) is that, by setting $R=0,~v_{0}=1_{\mathrm{~}}$ and $\boldsymbol{v}_{1}=0$ , we obtain a closed-form expression for the conditional characteristic function $\phi$ of $X_{T}$ given $X_{t}$ , defined by $\phi(u,X_{t},t,T)=E(\left.e^{i u\cdot X_{T}}\right|X_{t})$ , for real $u$ Because knowledge of $\phi$ is equivalent to knowledge of the joint conditional density function of $X_{T}$ , this result is useful in estimation and all other applications involving the transition densities of an AJD.

For instance, Singleton (2000) exploits knowledge of $\phi$ to derive maximum likelihood estimators for AJDs based on the conditional density $f(\cdot\vert X_{t})$ of $X_{t+1}$ given $X_{t}$ , obtained by Fourier inversion of $\phi$ as

$$
f(X_{t+1} \mid X_t) = \frac{1}{(2\pi)^N} \int_{\mathbb{R}^N} e^{-iu \cdot X_{t+1}} \phi(u, X_t, t, t+1) \, du. \tag{1.4}
$$

---

This content downloaded from 178.250.250.21 on Thu,14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:3 -->

Das (1998) exploits (1.4) for the specific case of a Poisson-Gaussian AJD to compute method-of-moments estimators of a model of interest rates.

Method-of-moments estimators can also be constructed directly in terms of the conditional characteristic function. From the definition of $\phi$

$$
E\left[e^{iu\cdot X_{t+1}} - \phi(u, X_t, t, t+1) \mid X_t\right] = 0, \tag{1.5}
$$

so any measurable function of $X_{t}$ is orthogonal to the “error” $\left(e^{i u\cdot X_{t+1}}-\phantom{e^{-i u\cdot X_{t+1}}}\right.$ $\phi(u,X_{t},t,t+1))$. Singleton (1999) uses this fact, together with the known functional form of $\phi$, to construct generalized method-of-moments estimators of the parameters governing AJDs and, more generally, the parameters of asset pricing models in which the state follows an AJD. These estimators are computationally tractable and, in some cases, achieve the same asymptotic efficiency as the maximum likelihood estimator. Jiang and Knight (1999) and Chacko and Viceira (1999) propose related, characteristic-function based estimators of the stochastic volatility model of asset returns with volatility following a square-root diffusion.$^{4}$

### 1.3. Affine Option-Pricing Models

In an influential paper in the option-pricing literature, Heston (1993) showed that the risk-neutral exercise probabilities appearing in the call option-pricing formulas for bonds, currencies, and equities can be computed by Fourier inversion of the conditional characteristic function, which he showed is known in closed form for his particular affine, stochastic volatility model. Building on this insight, a variety of option-pricing models have been developed for state vectors having at most a single jump type (in the asset return), and whose behavior between jumps is that of a Gaussian or “square-root'’ diffusion.$^{6}$

Knowing the extended transform (1.1) in closed-form, we can extend this option pricing literature to the case of general multi-dimensional AJD processes with much richer dynamic interrelations among the state variables and much richer jump distributions. For example, we provide an analytically tractable method for pricing derivatives with payoffs at a future time $T$ of the form $(e^{b\cdot X_{T}}-c)^{+}$, where $c$ is a constant strike price, $b\in\mathbb{R}^{n}$ $X$ is an AJD, and $y^{+}\equiv\operatorname*{max}(y,0)$. This leads directly to pricing formulas for plain-vanilla options on currencies and equities, quanto options (such as an option on a common

$^{4}$Liu, Pan, and Pedersen (2000) and Liu (1997) propose alternative estimation strategies that exploit the special structure of affine diffusion models.

$^{6}$Among the many recent papers examining option prices for the case of state variables following square-root diffusions are Bakshi, Ca0, and Chen (2000), Bakshi and Madan (2000), Bates (1996), Bates (1997), Chen and Scott (1993), Chernov and Ghysels (1998), Pan (1998), Scott (1996), and Scott (1997), among others.

$^{7}$More precisely, the short-term interest rate has been assumed to be an affine function of independent square-root diffusions and, in the case of equity and currency option pricing, spot-market returns have been assumed to follow stochastic-volatility models in which volatility processes are independent “square-root” diffusions that may be correlated with the spot-market return shock.

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject tohttp://about.jstor.org/terms

<!-- Page:4 -->

stock or bond struck in a different currency), options on zero-coupon bonds, caps, floors, chooser options, and other related derivatives. Furthermore, we can price payoffs of the form $(b\cdot X_{T}-c)^{+}$ and $(e^{a\cdot X_{T}}b\cdot X_{T}-c)^{+}$, allowing us to price “slope-of-the-yield-curve” options and certain Asian options.[^1]

In order to visualize our approach to option pricing, consider the price $p$ at date O of a call option with payoff $(e^{d\cdot X_{T}}-c)^{+}$ at date $T$, for given $d\in\mathbb{R}^{n}$ and strike $c$，where $X$ is an $n$-dimensional AJD, with a short-term interest-rate process that is itself affine in $X$. For any real number $y$ and any $a$ and $b$ in $\mathbb{R}^{n}$ let $G_{a,b}(y)$ denote the price of a security that pays $e^{\boldsymbol{a}\cdot\boldsymbol{X}_{T}}$ at time $T$ in the event that $\hat{b}\cdot X_{T}\leq y$. As the call option is in the money when $-d\cdot X_{T}\leq-\ln c$, and in that case pays $e^{d\cdot X_{T}}-c e^{0\cdot X_{T}}$, we have the option priced at

$$
p = G_{d,-d}(-\ln c) - c G_{0,-d}(-\ln c) \tag{1.6}
$$

Because it is an increasing function, $G_{a,b}(\cdot)$ can be treated as a measure. Thus, it is enough to be able to compute the Fourier transform $\mathcal{G}_{a,b}(\cdot)$ of $G_{a,b}(\cdot)$ defined by

$$
\mathcal{G}_{a,b}(z) = \int_{-\infty}^{+\infty} e^{izy} dG_{a,b}(y),
$$

for then well-known Fourier-inversion methods can be used to compute terms of the form $G_{a,b}(y)$ in (1.6).

There are many cases in which the Fourier transform $\mathcal{G}_{a,b}(\cdot)$ of $G_{a,b}(\cdot)$ can be computed explicitly. We extend the range of solutions for the transform $\mathcal{G}_{a,b}(\cdot)$ from those already in the literature to include the entire class of AJDs by noting that $G_{a,b}(z)$ is given by (1.1), for the complex coefficient vector $u=a+i z b$, with $v_{0}=1$ and $v_{1}=0$. This, because of the affine structure, implies under regularity conditions that

$$
G_{a,b}(z) = e^{\alpha(0) + \beta(0) \cdot X_0}, \tag{1.7}
$$

where $\alpha$ and $\beta$ solve known, complex-valued ordinary differential equations (ODEs) with boundary conditions at $T$ determined by $z$. In some cases, these ODEs have explicit solutions. These include independent square-root diffusion models for the short-rate process, as in Chen and Scott (1995), and the stochastic-volatility models of asset prices studied by Bates (1997) and Bakshi, Cao, and Chen (1997). Using our ODE-based approach, we derive other explicit examples, for instance, stochastic-volatility models with correlated jumps in both returns and volatility. In other cases, one can easily solve the ODEs for $\alpha$ and $\beta$ numerically, even for high-dimensional applications.

---

In a complementary analysis of derivative security valuation, Bakshi and Madan (2000) show that knowledge of the special case of (1.1) with $v_{0}+v_{1}\cdot X_{T}=1$ is sufficient to recover the prices of standard call options, but they do not provide explicit guidance as to how to compute this transform. Their applications to Asian and other options presumes that the state vector follows square-root or Heston-like stochastic-volatility models for which the relevant transforms had already been known in closedforn.

This content downloaded from 178.250.250.21 on Thu,14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

[^1]: In a complementary analysis of derivative security valuation, Bakshi and Madan (2000) show that knowledge of the special case of (1.1) with $v_{0}+v_{1}\cdot X_{T}=1$ is sufficient to recover the prices of standard call options, but they do not provide explicit guidance as to how to compute this transform. Their applications to Asian and other options presumes that the state vector follows square-root or Heston-like stochastic-volatility models for which the relevant transforms had already been known in closedforn.

<!-- Page:5 -->

Similar transform analysis provides a price for an option with a payoff of the form $(d\cdot X_{T}-c)^{+}$ , again for the general AJD setting. For this case, we provide an equally tractable method for computing the Fourier transform of $\tilde{G}_{a,b,d}(\cdot)_{;}$ where $\tilde{G}_{a,b,d}^{\tilde{}^{\prime}}(y)$ is the price of a security that pays $e^{d\cdot X_{T}}a\cdot X_{T}$ at $T$ in the event that $b\cdot X_{T}\leq y$ . This transform is again of the form (1.1), now with $v_{1}=a$ . Given this transform, we can invert to obtain $\tilde{G}_{a,b,d}(y)$ and the option price $p^{\prime}$ as

$$
p' = \tilde{G}_{a,-a,0}(-\ln c) - c G_{0,-a}(-\ln c) \tag{1.8}
$$

As shown in Section 3, these results can be used to price slope-of-the-yield-curve options and certain Asian options.

Our motivation for studying the general AJD setting is largely empirical. The AJD model takes the elements of the drift vector, “instantaneous” covariance matrix, and jump measure of $X$ tobe affinefunctions of $X$ Thisallowsfor conditional variances that depend on all of the state variables (unlike the Gaussian model), and for a variety of patterns of cross-correlations among the elements of the state vector (unlike the case of independent square-root diffusions). Dai and Singleton (1999), for instance, found that both time-varying conditional variances and negatively correlated state variables were essential ingredients to explaining the historical behavior of term structures of U.S. interest rates.

Furthermore, for the case of equity options, Bates (1997) and Bakshi, Cao, and Chen (1997) found that their affine stochastic-volatility models did not fully explain historical changes in the volatility smiles implied by S&P 500 index options. Within the affine family of models, one potential explanation for their findings is that they unnecessarily restricted the correlations between the state variables driving returns and volatility. Using the classification scheme for affine models found in Dai and Singleton (1999), one may nest these previous stochastic-volatility specifications within an AJD model with the same number of state variables that allows for potentially much richer correlation among the return and volatility factors.

The empirical studies of Bates (1997) and Bakshi, Ca0, and Chen (1997) also motivate, in part, our focus on multivariate jump processes. They concluded that their stochastic-volatility models (with jumps in spot-market returns only) do not allow for a degree of volatility of volatility sufficient to explain the substantial "smirk" in the implied volatilities of index option prices. Both papers conjectured that jumps in volatility, as well as in returns, may be necessary to explain option-volatility smirks. Our AJD setting allows for correlated jumps in both volatility and price. Jumps may be correlated because their amplitudes are drawn from correlated distributions, or because of correlation in the jump times. (The jump times may be simultaneous, or have correlated stochastic arrival intensities.)

In order to illustrate our approach, we provide an example of the pricing of plain-vanilla calls on the S& P 500 index. A cross-section of option prices for a given day are used to calibrate AJDs with simultaneous jumps in both returns

---

This content downloaded from 178.250.250.21 on Thu,14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:6 -->

and volatility. Then we compare the implied-volatility smiles to those observed in the market on the chosen day. In this manner we provide some preliminary evidence on the potential role of jumps in volatility for resolving the volatility puzzles identified by Bates (1997) and Bakshi, Cao, and Chen (1997). 

The remainder of this paper is organized as follows. Section 2 reviews the class of affine jump-diffusions, and shows how to compute some relevant transforms, and how to invert them. Section 3 presents our basic option-pricing results. The example of the pricing of plain-vanilla calls on the S& P 500 index is presented in Section 4. Additional appendices provide various technical results and extensions. 

## 2. TRANSFORM ANALYSIS FOR AJD STATE-VECTORS

This section presents the AJD state-process model and the basic-transform calculations that will later be useful in option pricing.

### 2.1. The Affine Jump-Diffusion

We fix a probability space $(\varOmega,\mathscr{F},P)$ and an information filtration\* $(\mathcal{F}_{t})$ and suppose that $X$ is a Markov process in some state space $D\subset\mathbb{R}^{n}$, solving the stochastic differential equation

$$
dX_t = \mu(X_t)dt + \sigma(X_t)dW_t + dZ_t \tag{2.1}
$$

where $W$ is an $\mathcal{F}_{t}$-standard Brownian motion in $\mathbb{R}^{n}$; $\mu:D \to \mathbb{R}^{n}$, $\sigma:D \to \mathbb{R}^{n\times n}$, and $Z$ is a pure jump process whose jumps have a fixed probability distribution $\nu$ on $\mathbb{R}^{n}$ and arrive with intensity $\{\lambda(X_{t}){:}t\geq0\}$, for some $\lambda{:}D\to[0,\infty)$.

To be precise, we suppose that $X$ is a Markov process whose transition semi-group has an infinitesimal generator $\mathcal{D}$ of the Lévy type, defined at a bounded $C^{2}$ function $f{:}D\to\mathbb{R}$, with bounded first and second derivatives, by

$$
\mathcal{D}f(x) = f_x(x)\mu(x) + \frac{1}{2}\operatorname{tr}\left[f_{xx}(x)\sigma(x)\sigma(x)^\top\right] \tag{2.2}
$$

$$
+ \lambda(x) \int_{\mathbb{R}^n} [f(x+z) - f(x)] d\nu(z).
$$

Intuitively, this means that, conditional on the path of $X$, the jump times of $Z$ are the jump times of a Poisson process with time-varying intensity $\{\lambda(X_{s}){:}0\le s\leq t\}$, and that the size of the jump of $Z$ at a jump time $T$ is independent of $\{X_{s}\colon0\leq s<T\}$ and has the probability distribution $\nu$.

---

&The filtration $(\mathcal{F}_{t})=\{\mathcal{F}_{t}:t\geq0\}$ is assumed to satisfy the usual conditions, and $X$ is assumed to be Markovrelativeto $(\mathcal{F}_{t})$. For technical details, see for example, Ethier and Kurtz (1986). 9The generator $\mathcal{D}$ is defined by the property that $\{f(X_{t})-\textstyle{\int_{0}^{t}}{\mathcal{D}}f(X_{s})d s\colon t\geq0\}$ is a martingale for any $f$ in its domain. See Ethier and Kurtz (1986) for details.

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:7 -->

For notational convenience, we assume that $X_{0}$ is “known” (has a trivial distribution). Appendices provide additional technical details, as well as generalizations to multiple jump types with different arrival intensities, and to time-dependent $(\mu,\sigma,\lambda,\nu)$

We impose an “affine” structure on $\mu$, $\boldsymbol{\sigma}\boldsymbol{\sigma}^{\intercal}$, and $\lambda$, in that all of these functions are assumed to be affine on $D$. In order for $X$ to be well defined, there are joint restrictions on $(D,\mu,\sigma,\lambda,\nu)$, as discussed in Duffie and Kan (1996) and Dai and Singleton (1999). The case of one-dimensional nonnegative affine processes, generalized as in Appendix B to the case of general Lévy jump measures, corresponds to the case of continuous branching processes with immigration (CBI processes). For this case, Kawazu and Watanabe (1971) provide conditions (in the converse part of their Theorem 1.1) on $\mu,\sigma,\lambda$, and $\nu$ for existence, and show that the generator of the process is affine (in the above sense) if and only if the Laplace transform of the transition distribution of the process is of the exponential-affine form.$^{10}$

### 2.2. Transforms

First, we show that the Fourier transform of $X_{t}$ and of certain related random variables is known in closed form up to the solution of an ordinary differential equation (ODE). Then, we show how the distribution of $X_{t}$ and the prices of options can be recovered by inverting this transform.

We fix an affine discount-rate function $R{:}D\rightarrow\mathbb{R}$. The affine dependence of $\mu,\boldsymbol{\sigma}\boldsymbol{\sigma}^{\top},\boldsymbol{\lambda}$ and $R$ are determined by coefficients $(K,H,l,\rho)$ defined by:

$$
\mu(x)=K_{0}+K_{1}x,\quad\text{for}\quad K=(K_{\scriptscriptstyle0},K_{\scriptscriptstyle1})\in\mathbb{R}^{n}\times\mathbb{R}^{n\times n}
$$

$$
\left(\boldsymbol{\sigma}(\boldsymbol{x})\boldsymbol{\sigma}(\boldsymbol{x})^{\top}\right)_{ij}=\left(\boldsymbol{H_{0}}\right)_{ij}+\left(\boldsymbol{H_{1}}\right)_{ij}\cdot\boldsymbol{x},\quad\text{for}\quad H=(H_{0},H_{1})\in\mathbb{R}^{n\times n}\times\mathbb{R}^{n\times n\times n}
$$

$$
\lambda(x)=l_{0}+l_{1}\cdot x,\quad\text{for}\quad l=(l_{0},l_{1})\in\mathbb{R}\times\mathbb{R}^{n}
$$

$$
R(x)=\rho_{0}+\rho_{1}\cdot x,\quad\text{for}\quad \rho=(\rho_{0},\rho_{1})\in\mathbb{R}\times\mathbb{R}^{n}
$$

For $c\in\mathbb{C}^{n}$, the set of $n$-tuples of complex numbers, we let $\theta(c)=\int_{\mathbb{R}^{n}}\exp(c\cdot z)d\nu(z)$ whenever the integral is well defined. This “jump transform” $\theta$ determines the jump-size distribution.

The “coefficients” $(K,H,l,\theta)$ of $X$ completely determine its distribution, given an initial condition $X(0)$. A “characteristic” $\chi=(K,H,l,\theta,\rho)$ captures both the distribution of $X$ as well as the effects of any discounting, and determines a transform $\psi\colon\mathbb{C}^{n}\times D\times\mathbb{R}_{+}\times\mathbb{R}_{+}\to\mathbb{C}$ of $X_{T}$ conditional on $\mathcal{F}_{t}$, when well defined at $t\leq T$, by

$$
\psi^\chi(u, X_t, t, T) = E^\chi\left(\exp\left(-\int_t^T R(X_s) ds\right) e^{u \cdot X_T} \middle| \mathcal{F}_t \right), \tag{2.3}
$$

Independently of our work, Filipović (1999) applies these results regarding CBI processes to fully characterize all affine term structure models in which the short rate is, under an equivalent martingale measure, a one-dimensional nonnegative Markov process. Extending the work of Brown and Schaefer (1993), Filipović shows that it is necessary and sufficient for an affine term structure model in this setting that the underlying short rate process is, risk-neutrally, a CBI process.

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:8 -->

where $E^{\chi}$ denotes expectation under the distribution of $X$ determined by $\chi$ Here, $\psi^{\chi}$ differs from the familiar (conditional) characteristic function of the distribution of $X_{T}$ because of the discounting at rate $R(X_{t})$

The key to our applications is that, under technical regularity conditions given in Proposition 1 below,

$$
\psi^\chi(u,x,t,T) = e^{\alpha(t) + \beta(t) \cdot x}
$$

where $\beta$ and $\alpha$ satisfy the complex-valued ODEs[^1]

$$
\dot{\beta}(t) = \rho_1 - K_1^\top \beta(t) - \frac{1}{2} \beta(t)^\top H_1 \beta(t) - l_1(\theta(\beta(t)) - 1) \tag{2.5}
$$

$$
\dot{\alpha}(t) = \rho_0 - K_0 \cdot \beta(t) - \frac{1}{2} \beta(t)^\top H_0 \beta(t) - l_0(\theta(\beta(t)) - 1), \tag{2.6}
$$

with boundary conditions $\beta(T)=u$ and $\alpha(T)=0,$ The ODE (2.5)-(2.6) is easily conjectured from an application of Ito's Formula to the candidate form (2.4) of $\psi^{\chi}$ . In order to apply our results, we would need to compute solutions $\alpha$ and $\beta$ to these ODEs. In some applications, as for example in Section 4, explicit solutions can be found. In other cases, solutions would be found numerically, for example by Runge-Kutta. This suggests a practical advantage of choosing a jump distribution $\nu$ with an explicitly known or easily computed jump transform $\theta$

The following technical conditions will justify this method of calculating the transform.

DEFINITION: A characteristic $(K,H,l,\theta,\rho)$ is well-behaved at $(u,T)\in\mathbb{C}^{n}\times$ $[0,\infty)$ if (2.5)-(2.6) are solved uniquely by $\beta$ and $\alpha$ ; and if

$$
E\left( \int_{0}^{T} | \gamma_{t} | \, dt \right) < \infty, \quad \text{where} \quad \gamma_{t} = \Psi_{t}(\theta(\beta(t)) - 1) \lambda(X_{t}),
$$

$$
E\left[\left(\int_0^T \eta_t \cdot \eta_t dt\right)^{1/2}\right] < \infty, \text{ where } \eta_t = \Psi_t \beta(t)^\top \sigma(X_t), \text{ and}
$$

$$
E(|\Psi_T|) < \infty,
$$

where $\begin{array}{r}{\Psi_{t}=\exp(-\int_{0}^{t}R(X_{s})d s)e^{\alpha(t)+\beta(t)\cdot X(t)}.}\end{array}$

PROPOSITION 1: Suppose $(K,H,l,\theta,\rho)$ is well-behaved at $(u,T)$ .Then the transform $\psi^{\chi}$ of $X$ defined by (2.3) is given by (2.4).

PROOF: It is enough to show that $\psi$ is a martingale, for then $\psi_{t}=E(\psi_{T}\mid\mathcal{F}_{t})$ and we can multiply $\boldsymbol{\varPsi}_{t}$ by $\exp(\textstyle\int_{0}^{t}R(X_{s})d s)$ to get the result. By Ito's Formula,

$$
\Psi_t = \Psi_0 + \int_0^t \mu_\Psi(s) \, ds + \int_0^t \eta_s \, dW_s + J_t \tag{2.7}
$$

I Here, $c^{T}H_{1}c$ denotes the vector in $\mathbb{C}^{n}$ With $k$ thelement $\begin{array}{r}{\sum_{i,j}c_{i}(H_{1})_{i j k}c_{j}.}\end{array}$

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:9 -->

where, using the fact that $\alpha$ and $\beta$ satisfy the ODE (2.5)-(2.6), we have $\mu_{\ast\astrosun}=0$ and where 

$$
J_t = \sum_{0 < \tau(i) \leq t} (\Psi_{\tau(i)} - \Psi_{\tau(i)-}) - \int_0^t \gamma_s ds,
$$

with $\tau(i)=\operatorname*{inf}\{t\colon N_{t}=i\}$ denoting the $i$ th jump time of $X$ Under the integrability condition $(i)$ , Lemma 1 of Appendix A implies that $J$ is a martingale. Under integrability condition (i), $\textstyle{\int}\eta d W$ is a martingale. Thus $\psi$ is a martingale and we are done. Q.E.D. 

Anticipating the application to option pricing, for each given $\left(d,c,T\right)\in\mathbb{R}^{n}\times$ $\mathbb{R}\times\mathbb{R}_{+}$ , our next goal is to compute (when well defined) the “expected present value' 

$$
C(d,c,T,\chi)=E^{\chi}\left(\exp\left(-\int_{0}^{T}R(X_{s})ds\right)\left(e^{d\cdot X_{T}}-c\right)^{+}\right). \tag{2.8}
$$

We have 

$$
C(d,c,T,\chi)=E^\chi\left(\exp\left(-\int_0^TR(X_s)ds\right)(e^{d\cdot X_T}-c)\mathbf{1}_{d\cdot X_T\geq\ln(c)}\right) =G_{d,-d}(-\ln(c);X_0,T,\chi)-cG_{0,-d}(-\ln(c);X_0,T,\chi), \tag{2.9}
$$

where, given some $(x,T,a,b)\in D\times[0,\infty)\times\mathbb{R}^{n}\times\mathbb{R}^{n}$ ， $G_{a,b}(\cdot;x,T,\chi)\colon\mathbb{R}\to\mathbb{R}_{+}$ is given by 

$$
G_{a,b}(y; X_0, T, \chi) = E^{\chi}\left(\exp\left(-\int_0^T R(X_s) ds\right) e^{a \cdot X_T} \mathbf{1}_{b \cdot X_T \leq y}\right). \tag{2.10}
$$

The Fourier-Stieltjes transform $\mathcal{G}_{a,b}(\cdot;X_{0},T,\chi)$ of $G_{a,b}(\cdot;X_{0},T,\chi)$ , if well defined, is given by 

$$
\mathcal{G}_{a,b}(v,X_0,T,\chi) = \int_{\mathbb{R}} e^{iuv} G_{a,b}(y,X_0,T,\chi)
$$

We may now extend the Lévy inversion formula$^{13}$ (from the typical case of a proper cumulative distribution function) to obtain the following result.

PROPOsITION 2 (Transform Inversion): Suppose, for fxed $T\in[0,\infty)$ ， $a\in\mathbb{R}^{n}$ and $b\in\mathbb{R}^{n}$ ,that $\chi=\left(K,H,l,\theta,\rho\right)$ iswell-behavedat $(a+i v b,T)$ for any $v\in\mathbb{R}$

---

see forexmle GilPelae 195and Wiliams (199for tratmt of the y irn formula.

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:10 -->

and that

$$
\int_{\mathbb{R}} |\psi^{\chi}(a + ivb, x, 0, T)| \, dv < \infty. \tag{2.11}
$$

Then $G_{a,b}(\cdot;x,T,\chi)$ is well defined by (2.10) and given by

$$
G_{a,b}(y;X_0,T,\chi) = \frac{\psi^{\chi}(a,X_0,0,T)}{2} - \frac{1}{\pi} \int_0^{\infty} \frac{\operatorname{Im}\left[\psi^{\chi}(a+ivb,X_0,0,T)e^{-ivy}\right]}{v} dv, \tag{2.12}
$$

where $\mathrm{Im}(c)$ denotes the imaginary part of $c\in\mathbb{C}$

A proof is given in Appendix A. For $R=0$ , this formula gives us the probability distribution function of $b\cdot X_{T}$ . The associated transition density of $X$ is obtained by differentiation of $G_{a,b}$ . More generally, this provides the transition function of $X$ with “killing” at rate $^{14}R$

### 2.3. Extended Transform

As noted in the introduction, certain pricing problems in our setting, for example Asian option valuation or default-time distributions, call for the calculation of the expected present value of the product of affine and exponentialaffine functions of $X_{T}$ . Accordingly, we define the “extended” transform $\phi^{\chi}$ $\mathbb{R}^{n}\times\mathbb{C}^{n}\times D\times\mathbb{R}_{+}\times\mathbb{R}_{+}\to\mathbb{C}$ of $X_{T}$ conditional on $\mathcal{F}_{t}$ when well defined for $t\leq T$ by

$$
\phi^{\chi}(v,u,X_t,t,T) = E\left(\exp\left(-\int_{t}^{T} R(X_s) \, ds\right)(v \cdot X_T) e^{u \cdot X_T} \bigg| \mathcal{F}_t\right). \tag{2.13}
$$

The extended transform $\phi^{\chi}$ can be computed by differentiation of the transform $\psi^{\chi}$ . just as moments can be computed from a moment-generating function (under technical conditions justifying differentiation through the expectation). In practice, computing the derivatives of the transform calls for solving a new set of ODEs, as indicated below. Specifically, under technical conditions, including the differentiability of the jump transform $\theta$ ,weshowthat

$$
\phi^{\chi}(v, u, x, t, T) = \psi^{\chi}(u, x, t, T) (A(t) + B(t) \cdot x), \tag{2.14}
$$

where $\psi^{\chi}$ is given by (2.4), and where $B$ and $A$ satisfy the linear ordinary differential equations

$$
-\dot{B}(t) = K_1^\top B(t) + \beta(t)^\top H_1 B(t) + l_1 \nabla \theta(\beta(t)) B(t) \tag{2.15}
$$

$^{14}\mathrm{A}$ negative $R$ is sometimes called a “creation” rate in Markov-process theory.

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:11 -->

with the boundary conditions $B(T)=v$ and $A(T)=0$ ，and where $\nabla\theta(c)$ is gradient of $\theta(c)$ with respect to $c\in\mathbb{C}^{n}$ 

<!-- Page:12 -->



<!-- Page:13 -->

Because $Q$ is an equivalent martingale measure, the coefficients $K_{i}^{Q}=$ $((K_{0}^{Q})_{i},(K_{1}^{Q})_{i})$ determining[^1] the “risk-neutral’ drift of $X^{(i)}=\ln S$ aregivenby 

$$
(K^Q_0)_i = \rho_0 - q_0 - \frac{1}{2}(H^Q_0)_{ii} - l^Q_0(\theta^Q(\varepsilon(i)) - 1) \tag{3.3}
$$

$$
(K_i^Q) = \rho_1 - q_1 - \frac{1}{2} (H_i^Q)_{ii} - l_1^Q(\theta^Q(\varepsilon(i)) - 1) \tag{3.4}
$$

where $\varepsilon(i)\in\mathbb{R}^{n}$ has 1 as its $i$ th component, and every other component equal to 0. 

Unless other security price processes are specified, the risk-neutral characteristic $\chi_{Q}$ is otherwise unrestricted by arbitrage considerations. There are analogous no-arbitrage restrictions on $\chi_{Q}$ for each additional specified security price process of the form ea+b·Xx. 

By the definition of an equivalent martingale measure and the results of Section 2.2, a plain-vanilla European call option with expiration time $T$ and strike $c$ hasaprice $p$ at time 0 that is given by (2.9) to be 

$$
p = G_{\varepsilon(i), -\varepsilon(i)}\left(-\ln(c); X_0, T, \chi_Q\right) - cG_{0, -\varepsilon(i)}\left(-\ln(c); X_0, T, \chi_Q\right). \tag{3.5}
$$

To be precise, we can exploit Propositions 1 and 2 and summarize this option-pricing tool as follows, extending Heston (1993), Bates (1996), Scott (1997), Bates (1997), Bakshi and Madan (2000), and Bakshi, Ca0, and Chen (1997). 

PROPOsITION 4: The option-pricing formula (2.9) applies, where $G$ iscomputed by (2.12), provided: 

(a) $\chi$ is well-behaved at $(d-i v d,T)$ and at $(-i v d,T)$ for all $v\in\mathbb{R}_{+}$ , and (b) $\begin{array}{r}{\int_{\mathbb R}|\psi^{\chi}(d-i v d,x,0,T)|d v<\infty}\end{array}$ and $\begin{array}{r}{\int_{\mathbb{R}}|\psi^{\chi}(-i v d,x,0,T)|d v<\infty}\end{array}$ 

### 3.2. State-Price Density 

Supposethe statevector $X$ is  an  affine  jump-diffusion  with  coefficients $(K,H,l,\theta)$ under the actual (data-generating) measure $P$ . Let $\xi$ be an $(\mathcal{F}_{t})$ adapted “state-price density,” defined by the property that the market value at time $t$ of any security that pays an $\mathcal{F}_{T}$ -measurable random variable $V$ at time $T$ 

$$
S_{t} - S_{0} = \int_{0}^{t} S_{u} [R(X_{u}) - \zeta(X_{u})] du + \int_{0}^{t} S_{u} \sigma^{(i)}(X_{u})^{\top} dW_{u}^{Q}
$$

where $W^{Q}$ is an $(\mathcal{F}_{t})$ -standard Brownian motion in $\mathbb{R}^{n}$ under $Q$ (Here, $\varDelta X_{t}=X_{t}-X_{t-}$ denotesthe jump of $X$ at $t,$ ) As the sum of the last 3 terms is a local $Q$ -martingale, this indeed implies consistency with the definition of an equivalent martingale measure. 

---

[^1]: Under (3.3)-(3.4), we have 

This content downloaded from 178.250.250.21 on Thu,14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms 

<!-- Page:14 -->

is given by 

$$
\frac{1}{\xi(t)}E(V\xi(T) \mid \mathcal{F}_t).
$$

We assume for convenience that $\xi_{t}=e^{a(t)+b(t)\cdot X_{t}}$ , for some bounded measurable $a{:}[0,\infty)\rightarrow\mathbb{R}$ and $b{:}[0,\infty)\rightarrow\mathbb{R}^{n}$ .Without loss of generality, we take it that $\xi(0)=1$

Suppose the price of a given underlying security at time $T$ is $e^{d\cdot X(T)}$ forsome $d\in\mathbb{R}^{n}$ . By the definition of a state-price density, a plain-vanilla European call option struck at $c$ with exercise date $T$ has a price at time 0 of

$$
p = E[e^{a(T) + b(T) \cdot X(T)} (e^{d \cdot X(T)} - c)^+].
$$

This leaves the option price

$$
p = e^{a(T)} G_{b(T) + d, -d}(-\ln c; X_0, T, \chi^0) - ce^{a(T)} G_{b(T), -d}(-\ln c; X_0, T, \chi^0),
$$

where $\chi^{0}=\left(K,H,l,\theta,0\right)$ . (One notes that the short-rate process plays no role beyond that already captured by the state-price density.)

As mentioned at the beginning of this section, and detailed in Appendix C, an alternative is to translate the option-pricing problem to a “risk-neutral’ setting.

### 3.3. Other Option-Pricing Applications

This section develops as illustrative examples several additional applications to option pricing. For convenience, we adopt the risk-neutral pricing formulation. That is, we suppose that the short rate is given by $R(X)$ where $R$ is affine, and $X$ is an affine jump-diffusion under an equivalent martingale measure $Q$ The associated characteristic $\chi_{Q}$ is fixed. While we treat the case of call options, put options can be treated by the same method, or by put-call parity.

#### 3.3.1. Bond Derivatives

Consider a call option, struck at $c$ with exercise date $T$ ,on a zero-coupon bond maturing at time $s>T$ . Let $\varLambda(T,s)$ denote the time- $T$ market price of the underlying bond. From Duffie and Kan (1996), under the regularity conditions given in Section 2.2,

$$
\Lambda(T,s) = \exp(\alpha(T,s,0) + \beta(T,s,0) \cdot X_T),
$$

where, from this point, for any $u$ we write $\beta(t,T,u)$ and $\alpha(t,T,u)$ for the solution to (2.5)-(2.6), adding the arguments $(T,u)$ soas to indicate the dependence on the terminal time $T$ and boundary condition $u$ for $\beta$ , which will

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:15 -->

vary in what follows. At time $T$ , the option pays 

$$
(\Lambda(T,s)-c)^+=(e^{\alpha(T,s,0)}+\beta(T,s,0)\cdot X(T)-c)^+
$$

$$
= e^{\alpha(T,s,0)} \left( e^{\beta(T,s,0) \cdot X(T)} - e^{-\alpha(T,s,0) c} \right)^+ \tag{3.7}
$$

The value of the bond option can therefore be obtained from (2.9) and (2.12). The same approach applies to caps and floors, which are simply portfolios of zero-coupon bond options with payment in arrears, as reviewed in Appendix D. This extends the results of Chen and Scott (1995) and Scott (1996). Chacko and Das (1998) work out the valuation of Asian interest-rate options for a large class of affine models. They provide numerical examples based on a multi-factor Cox-Ingersoll-Ross state vector.

#### 3.3.2. Quantos

Consider a quanto of exercise date $T$ and strike $c$ on an underlying asset with price process $S=\exp(X^{(i)})$. The time- $T$ payoff of the quanto is $(S_{T}M(X_{T})-c)^{+}$ , where $M(x)=e^{m\cdot x}$ , for some $m\in\mathbb{R}^{n}$ . The quanto scaling $M(X_{T})$ could, for example, be the price at time $T$ of a given asset, or the exchange rate between two currencies. The initial market value of the quanto option is then

$$
G_{m+\varepsilon(i),-\varepsilon(i)}\left(-\ln(c);x,T,\chi_Q\right) - cG_{0,-\varepsilon(i)}\left(-\ln(c);x,T,\chi_Q\right).
$$

An alternative form of the quanto option pays $M(X_{T})(S_{T}-c)^{+}$ at $T$ , and has the price $G_{m+\varepsilon(i),-\varepsilon(i)}(-\ln(c);x,T,\chi_{Q})-c G_{m,-\varepsilon(i)}(-\ln(c);x,T,\chi_{Q}).$

#### 3.3.3. Foreign Bond Options

Let $\exp(X^{(i)})$ be a foreign-exchange rate, $R(X)$ be the domestic short interest rate, and $\zeta(X)$ be the foreign short rate, for affine $\zeta$ . Consider a foreign zero-coupon bond maturing at time $s$ , whose payoff at maturity, in domestic currency, is therefore $\exp(X_{s}^{(i)})$ . The risk-neutral characteristic $\chi_{Q}$ is restricted by (3.3)-(3.4). From Proposition 1, the domestic price at time $t$ of the foreign bond is $\varLambda^{f}(t,s)=\exp(\alpha(t,s,\varepsilon(i))+\beta(t,s,\varepsilon(i))\cdot\bar{X}_{t})$

We now consider an option on this bond with exercise date $T<s$ and domestic strike price $c$ On the foreign $s$ -year zero-coupon bond, paying $(A^{f}(T,s)-c)^{+}$ at time $T$ , in domestic currency. The initial market value of this option can therefore be obtained as for a domestic bond option.

#### 3.3.4. Chooser Options

Let $S^{(i)}=\exp(X^{(i)})$ and $S^{(j)}=\exp(X^{(j)})$ be two security price processes. An exchange, or “chooser,” option with exercise date $T$ , pays $\operatorname*{max}(S_{T}^{(i)},S_{T}^{(j)})$ . Depending on their respective dividend payout rates, the risk-neutral characteristic $\chi_{Q}$ is restricted by (3.3)-(3.4), applied to both $i$ and $j$ . The initial market value

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:16 -->

of this option is 

$$
G_{\varepsilon(i),\varepsilon(i)-\varepsilon(j)}(0;x,T,\chi_Q) + G_{\varepsilon(j),0}(0,x,T,\chi_Q) - G_{\varepsilon(j),\varepsilon(j)-\varepsilon(i)}(0;x,T,\chi_Q).
$$

#### 3.3.5. Asian Options 

Under the assumption of a deterministic short rate and dividend-yield process, that is, $\rho_{1}=q_{1}=0$ , we may also use the extended transform analysis of Section 2.3 to price Asian options. Let $X^{(i)}$ be the underlying price process of an Asian option with strike price $c$ and expiration date $T$ . The option pays $(1/T\int_{0}^{T}X_{t}^{(i)}\dot{d t}-c)^{+}$ at the expiration date $T$ . If $Q$ is an equivalent martingale measure, we must have

$$
dX_{t}^{(i)} = (R(X_{t}) - \zeta(X_{t}))X_{t}dt + dM_{t}^{(i)}
$$

where $M^{i}$ is a $\boldsymbol{Q}$ -martingale. For any $0\leq t\leq T$ , let $\begin{array}{r}{Y_{t}=\int_{0}^{t}X_{s}^{(i)}d s}\end{array}$ . For short rate $\rho_{0}$ , we can let $\tilde{\rho}_{0}=(\rho_{0},0)$ and $\rho_{1}=(0,0)=0$ , and see that, under $Q$ $\tilde{X}=(X,Y)$ is an $(n+1)$ -dimensional affine jump diffusion with characteristic $\tilde{\chi}=$ $(\tilde{K},\tilde{H},\tilde{l},\tilde{\theta},\tilde{\rho})$ that can be easily derived from using the fact that $d Y_{t}=X_{t}^{(i)}d t$ . We thus obtain the initial market value of the Asian option, under technical regularity, as

$$
\frac{1}{T}\tilde{G}_{\varepsilon(n+1),-\varepsilon(n+1),0}\Big(-cT;\tilde{X}_0,T,\tilde{\chi}\Big)-cG_{0,-\varepsilon(n+1)}\Big(-cT;\tilde{X}_0,T,\tilde{\chi}\Big),
$$

where $G(\cdot)$ is given by (2.12) and where, for $a,b$ , and $d$ in $\mathbb{R}^{n}$ 

$$
\tilde{G}_{a,b,d}(y;x,T,\chi) = \frac{\phi^{\chi}(a,d,x,0,T)}{2} \tag{3.8}
$$

$$
-\frac{1}{\pi}\int_{0}^{\infty}\frac{\operatorname{Im}[\phi^{\chi}(a,d+ivb,x,0,T)e^{-ivy}]}{v}dv.
$$

This calculation of $\tilde{G}_{a,b,d}$ and the Asian option price is in parallel with the calculation (2.12) of $G_{a,b}$ , using Fourier-inversion of the extended transform $\phi^{\chi}$ , and is justified provided that $\tilde{\chi}$ is extended well behaved at $(a,d+i v b,T)$ for any $v\in\mathbb{R}$ , and that $\begin{array}{r}{\int_{\mathbb R}|\phi^{\tilde{\chi}}(a,d+i v b,x,0,T)|d v<\infty}\end{array}$ .

As zero-coupon bond yields in an AJD setting are affine, we can also apply the extended-transform approach to the valuation of slope-of-the-yield-curve Options.

---

In this context, $\varepsilon(i)\in\mathbb{R}^{n+1}$ has 1 as its $i$ th component, and every other component equal to 0.

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:17 -->

## 4. A “DOUBLE-JUMP” ILLUSTRATIVE MODEL

As an illustration of the methodology, this section provides explicit transforms for a 2-dimensional affine jump-diffusion model. We suppose that $S$ is the price process, strictly positive, of a security that pays dividends at a constant proportional rate $\bar{\zeta}$, and we let $Y=\ln(S)$. The state process is $X=(Y,V)^{\top}$, where $V$ is the volatility process.

We suppose for simplicity that the short rate is a constant $r$, and that there exists an equivalent martingale measure $Q$, under which[^1]

$$
d\begin{pmatrix} Y_t \\ V_t \end{pmatrix} = \begin{pmatrix} r - \bar{\zeta} - \bar{\lambda}\bar{\mu} - \frac{1}{2}V_t \\ \kappa_v(\bar{v} - V_t) \end{pmatrix} dt + \sqrt{V_t}\begin{pmatrix} 1 & 0 \\ \bar{\rho}\sigma_v & \sqrt{1-\bar{\rho}^2}\sigma_t \end{pmatrix} dW^Q_t + dZ_t \tag{4.1}
$$

where $W^{Q}$ is an $(\mathcal{F}_{t})$-standard Brownian motion under $Q$ in $\mathbb{R}^{2}$, and $Z$ is a pure jump process in $\mathbb{R}^{2}$ with constant mean jump-arrival rate $\overline{{\lambda}}$, whose bivariate jump-size distribution $\nu$ has the transform $\theta$. A flexible range of distributions of jumps can be explored through the specification of $\theta$. The risk-neutral coefficient restriction (3.3) is satisfied if and only if $\overline{{\mu}}=\theta(1,0)-1$

Before we move on to special examples, we lay out the formulation for option pricing as a straightforward application of our earlier results. At time $t$, the transform[^2] $\psi$ of the log-price state variable $Y_{T}$ can be calculated using the ODE approach in (2.6) as

$$
\psi(u,(y,v),t,T) = \exp\left(\bar{\alpha}(T-t,u) + uy + \bar{\beta}(T-t,u)v\right) \tag{4.2}
$$

where, letting $b=\sigma_{\iota},\bar{\rho}u-\kappa_{\iota},a=u(1-u)$ and[^3] $\gamma=\sqrt{b^{2}+a{\sigma_{v}^{2}}^{2}}$, we have

$$
\bar{\beta}(\tau, u) = -\frac{a(1 - e^{-\gamma \tau})}{2\gamma - (\gamma + b)(1 - e^{-\gamma \tau})} \tag{4.3}
$$

$$
\overline{\alpha}(\tau,u) = \alpha_0(\tau,u) - \overline{\lambda}\tau(1 + \overline{\mu}u) + \overline{\lambda} \int_{0}^{\tau} \theta(u, \overline{\beta}(s,u)) \, ds \tag{4.4}
$$

where[^4]

$$
\alpha_0(\tau,u) = -r\tau + (r-\bar{\zeta})u\tau \\ - \kappa_v \bar{v} \left( \frac{\gamma+b}{\sigma_v^2} \tau + \frac{2}{\sigma_v^2} \ln \left[1 - \frac{\gamma+b}{2\gamma}(1-e^{-\gamma\tau})\right] \right),
$$

Unless otherwise stated, the distributional properties of (Y, V) described in this section are in a "risk-neutral” sense, that is, under $Q$

[^1]: Note that for any $z\in\mathbb{C}$ $\ln(z)=\ln\mid z\mid+i\arg(z)$ as defined on the “principal branch.”

[^2]: That is, $\psi(u,(y,v)^{\prime},t,T)=\psi^{\chi}((u,0)^{\prime},(y,v)^{\prime},t,T),$ where $\chi$ is the characteristic under $Q$ $X$ associated with the short rate defined by $(\rho_{0},\rho_{1})=(r,0)$

[^3]: To be more precise, $\gamma=\vert.\gamma^{2}\vert^{1/2}\stackrel{\cdot}{\exp(i\arg(\gamma^{2})/2)}$ where $\gamma^{2}=b^{2}+a\sigma_{v}^{2}$. Note that for any $z\in\mathbb{C}$ $\arg(z)$ is defined such that $z=\mid z\mid\exp(i\arg(z))$ with $-\pi<\arg(z)\leq\pi$

[^4]: For any $z\in\mathbb{C}$ $\ln(z)=\ln\mid z\mid+i\arg(z)$ as defined on the “principal branch.”

<!-- Page:18 -->

and where the term $\int_{0}^{\tau}\theta(u,\overline{{\beta}}(s,u))d s$ depends on the specific formulation of bivariate jump transform $\theta(\cdot,\cdot)$

### 4.1. A Concrete Example

As a concrete example, consider the jump transform $\theta$ defined by

$$
\theta(c_1, c_2) = \overline{\lambda}^{-1}(\lambda^y \theta^v(c_1) + \lambda^v \theta^v(c_2) + \lambda^c \theta^c(c_1, c_2)), \tag{4.5}
$$

where $\overline{\lambda}=\lambda^{y}+\lambda^{v}+\lambda^{c}$, and where

$$
\theta^{y}(c) = \exp\left(\mu_{y}c + \frac{1}{2}\sigma_{y}^{2}c^{2}\right),
$$

What we incorporate in this example is in fact three types of jumps:

· jumps in $Y$, with arrival intensity $\lambda^{y}$ and normally distributed jump size with mean $\mu_{y}$ and variance ${\sigma_{y}}^{2}$
· jumps in $V$, with arrival intensity $\lambda^{v}$ and exponentially distributed jump size with mean $\mu$
· simultaneous correlated jumps in $Y$ and $V$, with arrival intensity $\lambda^{c}$. The marginal distribution of the jump size in $V$ is exponential with mean $\mu_{c,\iota^{\prime}}$. Conditional on a realization, say $z_{v}$, of the jump size in $V$ the jump size in $Y$ is normally distributed with mean $\mu_e + \rho \sigma z_v$ and variance $\sigma^2$

In Bakshi, Cao, and Chen (1997) and Bates (1997), the SVJ-$\boldsymbol{\cdot}\boldsymbol{Y}$ model, defined by $\lambda^{v}=\lambda^{c}=0$, was studied using cross sections of options data to fit the "volatility smirk." They find that allowing for negative jumps in $Y$ is useful insofar as it increases the skewness of the distribution of $Y_{T}$, but that this does not generate the level of skewness implied by the volatility smirk observed in market data. They call for a model with jumps in volatility. Using this concrete "double-jump" example (4.5), we can address this issue, and provide some insights into what a richer specification of jumps may imply.

Before leaving this section to explore the implications of jumps for "volatility smiles," we provide explicit option pricing through the transform formula (4.2), by exploiting the bivariate jump transform $\theta$ specified in (4.5). We have

$$
\int_{0}^{\tau} \theta(u, \overline{\beta}(s,u)) ds = \overline{\lambda}^{-1} (\lambda^{y} f^{y}(u,\tau) + \lambda^{v} f^{v}(u,\tau) + \lambda^{c} f^{c}(u,\tau)),
$$

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:19 -->

where

$$
f^y(u,\tau)=\tau\exp\left(\mu_yu+\frac{1}{2}\sigma_y^2u^2\right),
$$

where $a=u(1-u),b=\sigma_{v}\bar{\rho}u-\kappa_{v},c=1-\rho_{J}\mu_{c,v}u$ and

$$
d = \frac{\gamma - b}{(\gamma - b)c + \mu_{c,v} a}\tau - \frac{2\mu_{c,v} a}{(\gamma c)^2 - (bc - \mu_{c,v} a)^2}\ln\left[1 - \frac{(\gamma + b)c - \mu_{c,v} a}{2\gamma c}(1 - e^{-\gamma\tau})\right]
$$

### 4.2. Jump Impact on "Volatility Smiles" 

As an illustration of the implications of jumps for the volatility smirk, we first select three special cases of the "double-jump" example just specified:

SV: Stochastic volatility model with no jumps, obtained by letting $\overline{{\lambda}}=0$

SVJ-Y: Stochastic volatility model with jumps in price only, obtained by letting $\lambda^{y}>0$ and $\lambda^{v}=\lambda^{c}=0$

SVJJ: Stochastic volatility with simultaneous and correlated jumps in price and volatility, obtained by letting $\lambda^{c}>0$ and $\lambda^{y}=\lambda^{v}=0$

In order to choose plausible values for the parameters governing these three special cases, we calibrated these three benchmark models to the actual "market-implied" smiles on November 2, 1993, plotted in Figure 1.[^1] For each model, calibration was done by minimizing (by choice of the unrestricted parameters) the mean-squared pricing error (MSE), defined as the simple average of the squared differences between the observed and the modeled option prices across all strikes and maturities. The risk-free rate $r$ is assumedto be $3.19\%$, and the dividend yield $\bar{\zeta}$ is assumed to be zero.

Table I displays the calibrated parameters of the models. Interestingly, for this particular day, we see that adding a jump in volatility to the SVJ-Y model, leading to the model SVJJ model, causes a substantial decline in the level of the

---

[^1]: The options data are downloaded from the home page of Yacine Ait-Sahalia. There is a total of 87 options with maturities (times to exercise date) ranging from 17 days to 318 days, and strike prices ranging from 0.74 to 1.17 times the underlying futures price.

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:20 -->

<center><i>FIGURE 1.—"Smile curves" implied by S&P 500 Index options of 6 different maturities. Option prices are obtained from market data of November 2, 1993.</i></center>

<div align="center">
  <img src="images/9a29750db4980c0665c282f9e7f043c4d99fc1f3d5053426b4e060395287fae2.jpg" style="max-width: 70%;" />
</div>

<center><i>TABLEI FITTED PARAMETER VALUES FOR SV, SVJ-Y, AND SVJJ MODELSa </i></center>

| 参数 | SV | SVJ-Y | SVJJ |
|---|---:|---:|---:|
| $\overline{\rho}$ | $-0.70$ | $-0.79$ | $-0.82$ |
| $\overline{\nu}$ | $0.019$ | $0.014$ | $0.008$ |
| $\kappa_v$ | $6.21$ | $3.99$ | $3.46$ |
| $\sigma_v$ | $0.61$ | $0.27$ | $0.14$ |
| $\lambda^c$ | $0$ | $0.11$ | $0.47$ |
| $\overline{\mu}$ | n/a | $-0.12$ | $-0.10$ |
| $\sigma_y$ | n/a | $0.15$ | $0.0001$ |
| $\mu_v$ | n/a | $0$ | $0.05$ |
| $\rho_J$ | n/a | n/a | $-0.38$ |
| $\sqrt{V_0}$ | $10.1\%$ | $9.4\%$ | $8.7\%$ |
| MSE | $0.0124$ | $0.0071$ | $0.0041$ |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>aThe parameters are estimated by minimizing mean squared errors (MSE). A total of 87 options, observed on November 2, 1993, are used. <img src="https://latex.codecogs.com/svg.image?\sqrt{V_{0}}" style="vertical-align: middle; height: 1.2em;" alt="\sqrt{V_{0}}" class="latex-formula"/> is the estimated value of stochastic volatility on the sample day.The_risk-free rate is assumed to be fixed at <img src="https://latex.codecogs.com/svg.image?r=3.19\%" style="vertical-align: middle; height: 1.2em;" alt="r=3.19\%" class="latex-formula"/> ,and the dividend yield at <img src="https://latex.codecogs.com/svg.image?\bar{\zeta}=0" style="vertical-align: middle; height: 1.2em;" alt="\bar{\zeta}=0" class="latex-formula"/> .From “risk neutrality," <img src="https://latex.codecogs.com/svg.image?\overline{{\mu}}=\theta(1,0)-1" style="vertical-align: middle; height: 1.2em;" alt="\overline{{\mu}}=\theta(1,0)-1" class="latex-formula"/> </i>
</div>
</center>

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:21 -->

parameter $\sigma_{v}$ determining the volatility of the diffusion component of volatility. Thus, the volatility puzzle identified by Bates and Bakshi, Cao, and Chen, namely that the volatility of volatility in the diffusion component of $V$ seems too high, is potentially explained by allowing for jumps in volatility. At the same time, the return jump variance $\stackrel{\cdot}{\sigma_{y}}^{2}$ declines to approximately zero as we replace the SVJ- $Y$ model with the SVJJ model. The instantaneous correlation among the jumps in return and volatility in the SVJ model is $\mu_{v}\rho_{J}(\sigma_{y}^{2}+\mu_{v}^{2}\rho_{J}^{2})^{-1/\bar{2}}$ Thus, one consequence of the small ${\sigma_{y}}^{2}$ is that the jump sizes of $Y$ and of $V$ are nearly perfectly anticorrelated. This correlation reinforces the negative skew typically found in estimation of the $S V$ model for these data[^24], as jumps down in return are associated with simultaneous jumps up in volatility.

In order to gain additional insight into the relative fit of the models to the option data used in our calibration, Figures 2 and 3 show the volatility smiles for the shortest (17-day) and longest (318-day) expiration options. For both maturities, there is a notable improvement of fit with the inclusion of jumps. Furthermore, the addition of a jump in volatility leads to a more pronounced smirk at both maturities and one that, based on the relative values of the MSE in Table I, produces a better overall fit on this day.

Next, we go beyond this fitting exercise, and study how the introduction of a volatility jump component to the SV and SVJ- $Y$ models might affect the "volatility smile," and how correlation between jumps in $Y$ and $V$ affects the "volatility smirk. We investigate the following three additional special cases:

1. The SVJ- $\boldsymbol{\cdot}\boldsymbol{V}$ model: We extend the fitted SV model by letting $\lambda^{v}=0.1$ and $\lambda^{y}=\overline{{\lambda}}^{c}=0$ . We measure the degree of contribution of the jump component of volatility by the fraction $\lambda^{\iota}\mu_{\iota}^{2}/(\bar{\sigma}_{\iota}^{2}V_{0}+\lambda^{\iota}\mu_{\iota}^{2})$ of the initial instantaneous variance of the volatility process $V$ that is due to the jump component. By varying $\mu_{\iota},$ , the mean of the volatility jumps, three levels of this volatility "jumpiness" fraction are considered: 0, $15\%$,and $30\%$ . For each case, the time-0 instantaneous drift, variance, and correlation are fixed at those implied by the fitted sV model by varying $\sigma_{\iota},\overline{{\iota}}$ , and $\overline{{\rho}}$

2. The SVJ-Y-V model: We extend the fitted SVJ- $Y$ model by letting $\lambda^{\prime\prime}=$ $\lambda^{y}$ $\lambda^{c}=0$ and $\lambda^{y}$ be fixed as given in Table I. Again, the volatility "jumpiness" is measured by the fraction of the instantaneous variance of $V$ that is due to the jump component. Three jumpiness levels, 0, $15\%$,and $30\%$ are again considered. For each case, the instantaneous drift, variance, and correlation are matched to the fitted SVJ- $Y$ model.

3. Finally, we modify the fitted SVJJ model by varying the correlation between simultaneous jumps in $Y$ and $V$ . Five levels of correlation are considered: $-1.0,\:-0.5,0,0.5$, and 1.0. For each case, the means and variances of jumps in $V$ and $Y$ are calibrated to the fitted SVJJ model.

The implied 30-day "volatility smiles" for the above three variations are plotted in Figures 4, 5, and 6.

---

[^24]: In addition to the "calibration" results in the literature, see the time-series results of Chernov and Ghysels (1998) and Pan (1998). For related work, see Poteshman (1998) and Benzoni (1998).

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:22 -->

<center><i>FIGURE 2.—"Smile curves" implied by S&P 500 Index options with 17 days to expiration. Diamonds show observed Black-Scholes implied volatilities on November 2, 1993. SV is the Stochastic Volatility Model, SVJ-Y is the Stochastic Volatility Model with Jumps in Returns, and SVJJ is the Stochastic Volatility Model with Simultaneous and Correlated Jumps in Returns and Volatility. Model parameters were calibrated with options data of November 2, 1993.</i></center>

<div align="center">
  <img src="images/72645c327abacf88058a40cc9e59c3f3dab5860a776c64ab237546102c9ca435.jpg" style="max-width: 70%;" />
</div>

The results for the SVJ- $\cdot V$ model show that, for out-of-the-money (OTM) calls, the introduction of a jump in volatility lowers Black-Scholes implied volatilities. Bakshi, Cao, and Chen (1997) found that their SVJ model (jumps in returns, but not in volatility) systematically overpriced OTM calls. So our analysis suggests that adding jumps in volatility may attenuate the overpricing in the SVJ model, at least for options that are not too far out of the money. The addition of a jump in volatility actually exacerbates the over pricing for far-outof-the-money calls. 

Model SVJ-Y-V is one illustrative formulation of a model with jumps in both $Y$ and $V$ Figure 5 shows that the addition of a jump in $V$ to the SVJ model also attenuates the over-pricing of OTM calls. Whether our parameterization of the jump distributions is enough to resolve the empirical puzzles relative to the SVJ model is an empirical issue that warrants further investigation. 

Finally, Figure 6 shows that, in the presence of simultaneous jumps, the levels of implied volatilities for OTM calls depend on the sign and magnitudes of the

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:23 -->

<center><i>FIGURE 3.-"Smile curves" implied by S&P 500 Index options with 318 days to expiration. "Stars" show observed implied volatility of November 2, 1993. SV is the Stochastic Volatility Model, SVJ-Y is the Stochastic Volatility Model with Jumps in Returns, and SVJJ is the Stochastic Volatility Model with Simultaneous and Correlated Jumps in Returns and Volatility. Model parameters were calibrated with options data of November 2, 1993.</i></center>

<div align="center">
  <img src="images/39779502b4f52209b7d2af2b5748c94571bcb721249c01061013a72d93505171.jpg" style="max-width: 70%;" />
</div>

correlation between the jump amplitudes. From our calibration of the SVJJ model, the data suggest that $\rho_{J}$ is negative (see Table I). Thus, for this day, simultaneous jumps tend to reduce the Black-Scholes implied volatilities of OTM calls compared to the model with simultaneous jumps with uncorrelated amplitudes.

### 4.3. Multi-factor Volatility Specifications

Though our focus in this section has been on jump distributions, we are also interested in multi-factor models of the diffusion component of stochastic volatility. Bates (1997) has emphasized the potential importance of more than one volatility factor for explaining the "term structure" of return volatilities, and included two, independent volatility factors in his model. Similarly, the empirical analysis in Gallant, Hsu, and Tauchen (1999) of a non-affine, 3-factor model of asset returns, with two of the three state coordinates dedicated to volatility

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:24 -->

<center><i>FIGURE 4.——30-day smile curve, varying volatility jumpiness, and no jumps in returns.</i></center>

<div align="center">
  <img src="images/bbeaf1d6e1f286709ae5d3862e2c3515a8f8c6682ee5e85cbdacc5f4343b38a7.jpg" style="max-width: 70%;" />
</div>

<!-- Page:25 -->

<center><i>FIGURE 5.——30-day smile curve, varying volatility jumpiness. Independent arrivals of jumps in returns and volatility, with independent jump sizes.</i></center>

<div align="center">
  <img src="images/693dc8c0f47e8ea28860c6aab0fb3a3335a04b3c62bd0664628100ad281ce042.jpg" style="max-width: 70%;" />
</div>

A one-factor volatility model, such as the SV model, may well over-simplify the term structure of volatility. In particular, the SV model has an autocorrelation of returns (over successive periods of length $\Delta$) of $\exp(-\kappa_{\iota},\varDelta)$, which decreases exponentially with $\varDelta$. For the estimated values of $\kappa$ typically found in practice, the autocorrelations of discretely sampled $V$ decay too quickly relative to what is found in the data. Bollerslev and Mikkelsen (1996) argue, based on their analysis of LEAPs, for a “long memory” model of volatility to capture this slow decay. The correlation of $(V_{t},V_{t+\Delta})$ (with respect to the ergodic distribution of $(V,\overbar{V}))$ implied by model (4.6) is

$$
\operatorname{corr}(V_t, V_{t+\Delta}) = e^{-\kappa \Delta} + (e^{-\kappa_0 \Delta} - e^{-\kappa \Delta}) \frac{\kappa \sigma_0^2 / (\kappa - \kappa_0)}{(\kappa + \kappa_0) \sigma^2 / \kappa + \kappa \sigma_0^2 / \kappa_0}
$$

By suitable choice of the parameter values, this correlation decays more slowly with $\varDelta$ than the exponential rate in the one-factor model. In a different context, Gallant, Hsu, and Tauchen (1999) found that the correlogram for $V$ was well approximated, at least over moderate horizons, by their two-factor volatility model, and we conjecture that the same is true of models like (4.6).

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:26 -->

<center><i>FIGURE 6.—30-day smile curve, varying the correlation between the sizes of simultaneous jumps in return and in volatility.</i></center>

<div align="center">
  <img src="images/8c8a762687949c18d84bcfa405d93db22dd3277e1bd572d251d3f31177fd7026.jpg" style="max-width: 70%;" />
</div>

subsequent work, we plan to further investigate multi-factor volatility specifications.

## APPENDICES

### A. TECHNICAL CONDITIONS AND ARGUMENTS

This Appendix contains technical results and conditions used in the body of the paper.

#### LEMMA 1: Under the assumptions of Proposition 1, J is a martingale.

---

Grad. School of Business, Stanford University, Stanford, CA 94305, U.S.A.; duffie@stanford.edu; http://www.stanford.edu/people/duffie, Sloan School of Management, Massachusetts Institute of Technology, Cambridge MA 02142, U.S.A.; junpan@mit.edu; http://www.mit.edu/~junpan, and Grad. School of Business, Stanford University, Stanford, CA 94305, U.S.A.; kenneths@future.stanford.edu; http://www.stanford.edu/people/kenneths

Manuscript received March, 1999; final revision received November, 1999.

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:27 -->

PROOF: Letting $E_{t}$ denote $\mathcal{F}_{t}$ -conditional expectation under $P$ for $0\leq t\leq s\leq T$ wehave 

$$
E_t\left(\sum_{t<\tau(i)\leq s}(\Psi_{\tau(i)}-\Psi_{\tau(i)-})\right)=E_t\left(\sum_{t<\tau(i)\leq s}E(\Psi_{\tau(i)}-\Psi_{\tau(i)-}\mid X_{\tau(i)-},\tau(i))\right)
$$

Because $\{\psi_{t-}(\theta(b(t))-1)\colon t\geq0\}$ is an $(\mathcal{F}_{t})$ -predictable process, and the jump-counting process $N$ has intensity $\{\lambda(X_{t},t)\colon t\leq T\}$ integrability condition $(i)$ implies that$^{25}$ 

$$
E_t\left(\int_t^s \Psi_{u-}(\theta(b(u))-1)dN_u\right) = E_t\left(\int_t^s \Psi_u(\theta(b(u))-1)\lambda(X_u,u)du\right).
$$

Hence $J$ is martingale. 

Proposition 2 is proved as follows. 

For $0<\tau<\infty$ , and a fixed $y\in\mathbb R$ 

$$
\frac{1}{2\pi}\int_{-\tau}^{\tau}\frac{e^{i\nu\psi\chi}(a-i\nu b,x,0,T)-e^{-i\nu\psi\chi}(a+i\nu b,x,0,T)}{i\nu}d\nu =\frac{1}{2\pi}\int_{-\tau}^{\tau}\int_{\mathbb{R}}\frac{e^{-i\nu(z-y)}-e^{i\nu(z-y)}}{i\nu}dG_{a,b}(z;x,T,\chi)d\nu =-\frac{1}{2\pi}\int_{\mathbb{R}}\int_{-\tau}^{\tau}\frac{e^{-i\nu(z-y)}-e^{i\nu(z-y)}}{i\nu}d\nu dG_{a,b}(z;x,T,\chi),
$$

where Fubini is applicable$^{26}$ because 

$$
\lim_{y \to +\infty} G_{a,b}(y;x,T,\chi) = \psi^{\chi}(a,x,0,T) < \infty,
$$

given that $\chi$ is well-behaved at $(a,T)$ 

Next we note that, for $\tau>0$ ， 

$$
\int_{-\tau}^{\tau} \frac{e^{-iu(z-y)} - e^{iu(z-y)}}{iu} dv = -\frac{\text{sgn}(z-y)}{\pi} \int_{-\tau}^{\tau} \frac{\sin(v |z-y|)}{v} dv
$$

is bounded simultaneously in $z$ and $\tau$ , for each fixed $y.^{27}$ By the bounded convergence theorem. 

$$
\lim_{\tau \to \infty} \frac{1}{2\pi} \int_{-\tau}^{\tau} \frac{e^{ivy} \psi^\chi(a-ivb,x,0,T) - e^{-ivy} \psi^\chi(a+ivb,x,0,T)}{iv} dv
$$

Here, we also use the fact that, for any $u,v\in\mathbb{R},|e^{i v}-e^{i u}|\leq|v-u|.$ 

---

$^{25}$See for example, page 27 of [Rmad (191)](cci:1://file:///Users/zhaochun/Downloads/10.1111%252Fj.1467-9965.2009.00385.x.pdf:18:0-18:0). We are applying the result for the real and imaginary components of the integrand, separately.

$^{27}$We define $\text{sgn}(x)$ to be 1 if $x>0$, 0 if $x=0$, and $-1$ if $x<0$

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:28 -->

Where $G_{a,b}(y-;x,T,\chi)=\operatorname*{lim}_{z\to y,z\leq y}G_{a,b}(z;x,T,\chi).$ Using the integrability condition (2.11), by the dominated convergence theorem we have

$$
G_{a,b}(y;x,T,\chi)=\frac{\psi^{X}(a,x,0,T)}{2} +\frac{1}{4\pi}\int_{-\infty}^{\infty}\frac{e^{ivy}\psi^{X}(a-ivb,x,0,T')-e^{ivy}\psi^{X}(a+ivb,x,0,T)}{iv}dv.
$$

Because $\psi^{\chi}(a-i v b,x,0,T)$ is the complex conjugate of $\psi^{\chi}(a+i v/b,x,0,T)$ we have (2.12).Q.E.1

Proposition 3, regarding the extended transform, relies on the following technical condition. For differentiabilityof $\theta$ at $u$ ,it isenoughthat $\theta$ is well defined and finite in a neighborhood of $\boldsymbol{u}$

DEFINITION: $(K,H,l,\theta,\rho)$ is“extendedwell-behaved at $(\iota;,u,T)$ , if (2.5)-(2.6) are solved uniquely by $\beta$ and $\alpha$ ,if the jump transform $\theta$ is differentiable at $\beta(t)$ for all $t\leq T$ , if (2.15) is solved uniquely by $B$ and $A$ , and if the following integrability conditions (i)-(i) are satisfied, where $\boldsymbol{\phi}_{t}=\boldsymbol{\Psi}_{t}(\boldsymbol{A}(t)+$ $B(t)\cdot X_{t})$

(i) $E(\:\int_{0}^{T}\mid\tilde{\gamma}_{t}\:|\:d t)<\infty$ where $\widetilde{\gamma}_{t}=\lambda(X_{t})(\varPhi_{t}(\theta(\beta(t))-1)+\varPsi_{t}\nabla\theta(\beta(t))B(t)).$ (i) $E[(\:j_{0}^{T}\tilde{\eta}_{t}\cdot\tilde{\eta}_{t}d t)^{1/2}]<\infty$ ,where $\widetilde{\eta}_{t}=\varPhi_{t}(\beta(t)^{\intercal}+B(t)^{\intercal})\sigma(X_{t})$ (ii) $E(|\Phi_{T}|)<\infty$

### B.MULTIPLE JUMP TYPES AND TIME DEPENDENCE

We can relax the jump behavior of $X$ to accommodate time dependencies in the coefficients and different types of jumps, each arriving with a different stochastic intensity.

We redefine $D$ to be a subset of $\mathbb{R}^{n}\times[0,\infty)$ , and treat the state process $X$ defined so that $(X_{t},t)$ is in $D$ for all $t$ .It is assumed that, for each $t$ $\{x\colon(x,t)\in D\}$ contains an open subset of $\textstyle\mathbb{R}^{n}$ .The time-dependent generator is now defined by

$$
\mathbb{D}f(x,t)=f_{t}(x,t)+f_{x}(x,t)\mu(x,t)+\frac{1}{2}\mathrm{tr}\left[f_{xx}(x,t)\sigma(x,t)\sigma(x,t)^{\top}\right]+\sum_{i}\lambda_{i}(x,t)\int_{\mathbb{R}^{n}}\left[f(x+z,t)-f(x,t)\right]d\nu_{i}^{j}(z)\tag{B.1},
$$

for sufficiently regular $f\colon D\to{\mathbb{R}}$ That is, jump type $i$ has jump-conditional distribution $\nu_{t}^{i}$ at time $t$ depending only on $t$ ,and stochastic intensity $\{\lambda_{i}(X_{t},t)\colon t\geq0\}$ ,for $i\in\{1,\ldots,m\}$ ,where $\lambda_{i}\colon D\to\mathbb{R}_{+}$ is defined by $\lambda_{i}(x,t)=l_{0}^{i}(t)+l_{t}^{i}(t)\cdot x$ ,for functions $(l_{0}^{1},l_{1}^{1}),\ldots,(l_{0}^{\prime\prime\prime},l_{1}^{\prime\prime\prime})$ on $[0,\infty)$ into $\mathbb{R}\times\mathbb{R}^{n}$ .The jump transforms $\theta=\left(\theta^{1},\ldots,\theta^{m}\right)$ are defined by $\theta^{i}(c,t)=j_{\mathbb{R}^{n}}\mathrm{exp}(c\cdot z)d\nu_{t}^{i}(z),c\in\mathbb{C}^{n},$ We take

$$
\mu(x,t)=K_0(t)+K_1(t)x,\\ \sigma(x,t)\sigma(x,t)^\top=H_0(t)+\sum_{k=1}^{n}H_1^{(k)}(t)x_k,
$$

where for each $t\geq0,K_{0}(t)$ is $n\times1,K_{1}(t)$ is $n\times n,H_{0}(t)$ is $n\times n$ and symmetric, and $H_{1}(t)$ is a tensor28 of dimension $n\times n\times n$ ，with symmetric $H^{(k)}(t)$ (for $k=1,\ldots,n)$ . The time-dependent coefficients $K=(K_{0},K_{1})$ $H=(H_{0},H_{1})$ ，and $l=(l_{0},l_{1})$ are assumed to be bounded continuous functions on $[0,\infty)$

In this more general setting, Propositions 1, 2, and 3 apply after introducing these time-dependent coefficients into (2.5) and (2.6), and replacing the last terms in the right-hand sides of these ODEswith $\Sigma_{i=1}^{m}l_{1}^{i}(t)(\theta^{i}(c,t)-1)$ and $\Sigma_{i=1}^{m}l_{0}^{i}(t)(\theta^{i}(c,t)-1)$ respectively.

---

28Let $H$ be an $n\times n\times n$ tensor, fix its third index to $k^{*}$ ; the tensor is reduced to an $n\times n$ matrix $H^{(k)}$ with elements, $H_{i j}^{(k)}=H(i,j,k)$

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:29 -->

We can further extend to the case of an infinite number of jump types by allowing for a general Levy jump measure that is affine in the state vector, as in the one-dimensional case treated by Kawazu and Watanabe (1971). (See Theorem 42, page 32, of Protter (1990).)

<!-- Page:30 -->

$\delta(i,j)t$, where $\delta(\cdot)$ is the Kronecker delta. By Levy's Theorem, $W^{\mathcal{Q}}$ is a standard Brownian motion in $\mathbb{R}^{n}$ under $Q$

Next, we let

$$
M^{Q}_t = N_t - \int_{0}^{t} \theta(\beta(s, T, b)) \lambda(X_s, s) ds, \quad t \geq 0. \tag{C.8}
$$

Lemma 3, below, shows that $\xi M^{Q}$ is a $P$-local martingale. It follows that $M^{\mathcal{Q}}$ is a $Q$-local martingale. By the martingale characterization of intensity, $^{2}$ we conclude that, under $Q,N$ is a counting process with the intensity $\{\lambda^{Q}(X_{t},t)\colon t\geq0\}$ defined by $\lambda^{Q}(x,t)=l_{0}^{Q}(t)+l_{1}^{Q}(t)\cdot x$

Using the fact that, under $Q$ $W^{Q}$ is a standard Brownian and the jump counting process $N$ has intensity $\{\lambda^{\mathcal{Q}}(X_{t},t)\colon t\geq0\}$, we may mimic the proof of Proposition 1, and obtain (C.6), replacing in the proof of Lemma 1 $E_{t}(\Sigma_{t<\tau(i)\leq T}(\Psi_{\tau(i)}-\Psi_{\tau(i)-}))$ with

$$
E^{Q}_{t}\left(\sum_{t<\tau(i)\leq T}(\Psi_{\tau(i)}-\Psi_{\tau(i)-})\right)=\frac{1}{\xi_{t}}E_{t}\left(\sum_{t<\tau(i)\leq T}\xi_{\tau(i)}(\Psi_{\tau(i)}-\Psi_{\tau(i)-})\right).
$$

This completes the proof.

LEMMA 2: Under the assumptions of Proposition 1, $\xi W^{Q}$ is a $P$-localmartingale.

PROOF: By Ito's Formula, with $0\leq s\leq t\leq T$

$$
\begin{aligned} \xi_t W^Q_t &= \xi_s W^Q_s + \int_s^t \xi_{u^-} dW^Q_u + \int_s^t W^Q_{u^-} d\xi_u \\ &\quad + \sum_{s<u\le t} (\xi_u - \xi_{u^-})(W^Q_u - W^Q_{u^-}) + \int_s^t d[\xi, W^Q]_u \\ &= \xi_s W^Q_s + \int_s^t \xi_{u^-}(dW_u - \sigma^\top(X_u, u)b(u)du) \\ &\quad + \int_s^t W^Q_{u^-} d\xi_u + \int_s^t \xi_u \sigma^\top(X_u, u)b(u)du \\ &= \xi_s W^Q_s + \int_s^t \xi_{u^-} dW_u + \int_s^t W^Q_{u^-} d\xi_u, \end{aligned}
$$

where $[\xi,W^{Q}]^{c}$ denotes the continuous part of the “square-brackets" process $[\xi,W^{\mathcal{Q}}]$ As $W$ and $\xi$ are $P$ martingales, both $\{j_{0}^{t}\xi_{u}-d W_{u}\colon t\geq0\}$ and $\{j_{0}^{\iota}W_{u}^{Q}d\xi_{u};t\geq0\}$ are $P$ local martingales. Hence, $\xi W^{\mathcal{Q}}$ is a $P$ local martingale. Q.E.D.

LEMMA 3: Under the assumptions of Proposition 1, $\xi M^{\mathcal{Q}}$ is a $P$-localmartingale.

PROOF: By Ito's Formula, with $0\leq s\leq t\leq T$

$$
\xi_{t} M^{Q}_{t} = \xi_{s} M^{Q}_{s} + \int_{s}^{t} \xi_{u-} dM^{Q}_{u} + \int_{s}^{t} M^{Q}_{u-} d\xi_{u} + \sum_{s < u \leq t} (\xi_{u} - \xi_{u-})(N_{u} - N_{u-})
$$

where $M_{t}=N_{t}-\operatorname{f}_{0}^{t}\lambda(X_{s},s)d s$, and where

$$
J^{\xi}=\sum_{s<u\leq t}(\xi_{uu}-\xi_{uu-})-\int_{s}^{t}\xi_{ut}(\theta(\beta(u,T,b),u)-1)\lambda(X_{u},u)du.
$$

---

See, for example, page 28 of Bremaud (1981).

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:31 -->

As $M$ and $\xi$ are $P_{-}$ martingales, $\{\textstyle\int_{0}^{t}\xi_{u}-d M_{u}\colon t\geq0\}$ and $\{j_{0}^{\prime}M_{u-}^{Q}d\xi_{u};t\ge0\}$ are $P$ -local martingales. By a proof similar to that of Lemma 1, and using the Integration Theorem $(\gamma)$ in Brémaud (1981), we can show that $J^{\xi}$ is a $P$ -local martingale. Q.E.D.

For the remainder of this appendix, we denote $Q$ by $Q(b)$, emphasizing the role of $^b$ in defining the change of probability measure given by (C.1). We let $\chi(b)=(\bar{K^{Q(b)}},H^{Q(b)},l^{Q(b)},\theta^{Q(b)},\rho\bar{)}$ denote the associated characteristic. The previous result shows in effect that, under $Q(b)$, the state vector $X$ is still an affine jump-diffusion whose characteristics can be computed in terms of the characteristics of $X$ under the measure $P$. This result provides us with an alternative approach to option pricing. We suppose that $Q(0)$ is an equivalent martingale measure. The price $\varGamma(X_{0},a,d,c,T)$ of an option paying $(e^{a+d\cdot X_{T}}-c)^{+}$ at $T$ is given by

$$
\Gamma(X_0, a, d, c, T) = E^{Q(0)}\left(\exp\left(-\int_0^T R(X_s, s) ds\right) \left(e^{a + d \cdot X_T} - c\right)^+\right)
$$

Provided the characteristic $(K,H,l,\theta,\rho)$ is well-behaved at $(d,T)$ and $(0,T),$ we may introduce the equivalent probability measure $Q(d)$, and write

$$
\Gamma(X_0, a, d, c, T) = e^a \exp(\alpha(0, T, d) + \beta(0, T, d) \cdot X_0) E^{Q(d)}(\mathbf{1}_{d \cdot X_T \geq \ln(c) - a}) \\ - c \exp(\alpha(0, T, 0) + \beta(0, T, 0) \cdot X_0) E^{Q(0)}(\mathbf{1}_{d \cdot X_T \geq \ln(c) - a})
$$

Let $\chi(1)=(K^{Q(d)},H^{Q(d)},l^{Q(d)},\theta^{Q(d)},0)$ and $\chi(0)=(K^{Q(0)},H^{Q(0)},l^{Q(0)},\theta^{Q(0)},0)$ be defned by (C.3)-(C.5) for $b=d$ and $b=0$. We suppose that $\chi(1)$ and $\chi(0)$ are well behaved at $(i v d,T)$ for any $v\in\mathbb{R}$. Then

$$
E^{Q(d)}(\mathbf{1}_{d\cdot X_T \geq \ln(c) - a}) = \frac{1}{2} + \frac{1}{\pi} \int_0^\infty \frac{\operatorname{Im}[\psi^{\chi^{(1)}}(ivd, x, 0, T) e^{-i v (\ln(c) - a)}]}{v} dv,
$$

provided $\begin{array}{r}{\int_{\mathbb R}|\psi^{\chi(1)}(i v d,X_{0},0,T)|d v<\infty}\end{array}$ and $\begin{array}{r}{\int_{\mathbb{R}}\mid\psi^{\chi(0)}(i v d,X_{0},0,T)\mid d v<\infty}\end{array}$. These quantities may now be substituted into the previous relation in order to obtain the option price.

### D. CAP PRICING

A cap is a loan with face value, say 1, at a variable interest rate that is capped at some level $\bar{r}$. At time $t$, let $\tau,2\tau,...,n\tau$ be the fixed dates for future interest payments. At each fixed date $k\tau$ the $\scriptstyle{\bar{r}}$ capped interest payment, or “caplet,” is given by $\tau(\mathcal{R}((k-1)\tau,k\tau)-\bar{r})^{+}$, where $\mathcal{R}((k-1)\tau,k\tau)$ is the $\tau$ year floating interest rate at time $(k-1)\tau$ defined by

$$
\frac{1}{1 + \tau \mathcal{A}((k-1)\tau, k\tau)} = \Lambda((k-1)\tau, k\tau).
$$

The market value at time O of the caplet paying at date $k\tau$ can be expressed as

$$
\text{Caplet}(k) = E^Q\left[\exp\left(-\int_0^{k\tau} R(X_u,u)du\right)\tau\left(\mathcal{R}((k-1)\tau,k\tau) - \bar{r}\right)^+\right]
$$

---

This content downloaded from 178.250.250.21 on Thu,14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:32 -->

Hence, the pricing of the $k$ th caplet is equivalent to the pricing of an in- $(k-1)\tau$ for- $\tau$ put struck at $1/(1+\tau\bar{r})$ which can be readily obtained by using Proposition 3 and put-call parity as $\mathrm{{Caplet}}(k)=$ $(1+\tau\bar{r})\overline{{C}}(k)$ where

$$
\overline{C}(k)=\Gamma\left(X_{0}, \overline{\alpha}, \overline{\beta}, \frac{1}{1+\tau \bar{r}},(k-1) \tau\right)-\Lambda(0,k\tau)+\frac{\Lambda(0,(k-1)\tau)}{1+\tau \bar{r}},
$$

where $\varGamma(X_{0},a,d,c,T)$ is the price of a claim to $(e^{a+c/\cdot X(T)}-c)^{+}$ paid at $T$ and where $\overline{{\alpha}}=\alpha((k-1)\tau,k\tau,0)$ and $\overline{{\beta}}=\beta((k-1)\tau,k\tau,0)$

## REFERENCES

BAKSHI, G., C. CA0, AND Z. CHEN (1997): "Empirical Performance of Alternative Option Pricing Models," Journal of Finance, 52, 2003-2049.
BAKSHI, G., AND D. MADAN (2000): "Spanning and Derivative-Security Valuation," Journal of Financial Economics, 55, 205-238.
BATEs, D. (1996): "Jump and Stochastic Volatility: Exchange Rate Processes Implicit in Deutsche Mark Options," The Review of Financial Studies, 9, 69-107.
-—- (1997): "Post-'87 Crash Fears in S& P 500 Futures Options," Working Paper 5894, National Bureau of Economic Research.
BENzoNl, L. (1998): "Pricing Options under Stochastic Volatility: An Econometric Analysis," Working Paper, J. L. Kellogg Graduate School of Management, Northwestern University.
BOLLERSLEV, T., AND H. O. MIKKELSEN (1996): "Modeling and Pricing Long Memory in Stock Market Volatility," Journal of Econometrics, 73, 151-184.
BREMAUD, P. (1981): Point Processes and Queues, Martingale Dynamics. New York: Springer-Verlag.
BROwN, R., AND S. SCHAEFER (1993): "Interest Rate Volatility and the Term Structure of Interest Rates," Philosophical Transactions of the Royal Society, Physical Sciences and Engineering, 347, 563-576.
BUHLMANN, H., F. DELBAEN, P. EMBRECHTS, AND A. N. SHIRYAEV (1996): "No-arbitrage, Change Of Measure and Conditional Esscher Transforms," CWI Quarterly, 9, 291-317.
CHACKo, G., AND S. DAs (1998): "Pricing Average Interest Rate Options: A General Approach," Working Paper, Harvard Business School, Harvard University.
CHACKo, G., AND L. VIcEIRA (1999): "Dynamic Consumption and Portfolio Choice with Stochastic Volatility," Working Paper, School of Business, Harvard University.
CHEN, R., AND L. ScOTT (1993): "Maximum Likelihood Estimation for a Multifactor Equilibrium Model of the Term Structure of Interest Rates," The Journal of Fixed Income, 3, 14-31.
- (1995): "Interest Rate Options in Multifactor Cox-Ingersoll-Ross Models of the Term Structure," Journal of Derivatives, 3, 53-72.
CHERNOv, M., AND E. GHYSELs (2000): "A Study Towards a Unified Approach to the Joint Estimation of Objective and Risk-Neutral Measures for the Purpose of Option Valuation," Journal of Financial Economics, 56, 407-458.
Cox, J. C., J. E. INGERsOLL, AND S. A. Ross (1985): "A Theory of the Term Structure of Interest Rates," Econometrica, 53, 385-407.
DAl, Q., AND K. SINGLETON (1999): "Specification Analysis of Affine Term Structure Models," Journal of Finance, forthcoming.
DAs, S. (1998): "Poisson-Gaussan Processes and The Bond Markets," Working Paper, Harvard Business School, Harvard University.
DELBAEN, F., AND W. SCHACHERMAYER (1994): "A General Version of the Fundamental Theorem of Asset Pricing," Mathematische Annalen, 300, 463-520.
DUFFIE, D., AND R. KAN (1996): "A Yield-Factor Model of Interest Rates," Mathematical Finance, 6, 379-406.
DUFFIE, D., AND K. SINGLETON (1999): "Modeling Terim Structures of Defaultable Bonds," Review of Financial Studies, 12, 687-720.
ETHIER, S., AND T. KuRTZ (1986): Markov Processes, Characterization and Convergence. New York: John Wiley & Sons.

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:33 -->

FILIPovic, D. (1999): "A General Characterization of Affne Term Structure Models," Working Paper, ETH, Zurich.

GALLANT, R., C.-T. HsU, AND G. TAUCHEN (1999): "Using Daily Range Data to Calibrate Volatility Diffusions and Extract the Forward Integrated Variance," Review of Economics and Statistics, 81, 617-631.

GIL-PELAEZ, J. (1951): "Note on the Inversion Theorem," Biormetrika, 38, 481-482.

HARRISON, M., AND D. KREPs (1979): "Martingales and Arbitrage in Multi-period Securities Markets," Journal of Economic Theory, 20, 381-408.

HEsTON, S. (1993): "A Closed-Form Solution of Options with Stochastic Volatility with Applications to Bond and Currency Options," The Review of Financial Studies, 6, 327-343.

JAMSHIDIAN, F. (1989): "An Exact Bond Option Formula," Journal of Finance, 44, 205-209.

JARROw, R., D. LANDO, AND S. TURNBULL (1997): "A Markov Model for the Term Structure of Credit Spreads," Review of Financial Studies, 10, 481-523.

JIANG, G., AND J. KNIGHT (199): "Efficient Estimation of the Continuous Time Stochastic Volatility Model Via the Empirical Characteristic Function," Working Paper, University of Western Ontario.

KAwAZU, K., AND S. WATANABE (1971): "Branching Processes with Immigration and Related Theorems," Theory of Probability and its Applications, 16, 36-54.

LANDo, D. (1998): "On Cox Processes and Credit Risky Securities," Review of Derivatives Research, 2, 99-120.

LIU, J. (1997): "Generalized Method of Moments Estimation of Affine Diffusion Processes," Working Paper, Graduate School of Business, Stanford University.

LIU, J., J. PAN, AND L. PEDERSEN (2000): "Density-Based Inference in Affine Jump-Diffusions," Working Paper, Graduate School of Business, Stanford University.

PAN, J. (1998): "Integrated Time-Series Analysis of Spot and Options Prices," Working Paper, Graduate School of Business, Stanford University.

PIAzZEs1, M. (1998): "Monetary Policy and Macroeconomic Variables in a Model of the Term Structure of Interest Rates," Working Paper, Stanford University.

POTEsHMAN, A. M. (1998): "Estimating a General Stochastic Variance Model from Options Prices," Working Paper, Graduate School of Business, University of Chicago.

PROTTER, P. (1990): Stochastic Integration and Differential Equations. New York: Springer-Verlag.

ScOTT, L. (1996): "The Valuation of Interest Rate Derivatives in a Multi-Factor Cox-Ingersoll-Ross Model that Matches the Initial Term Structure," Working Paper, University of Georgia.

ScOTT, L. (1997): "Pricing Stock Options in a Jump-diffusion Model with Stochastic Volatility and Interest Rates: Application of Fourier Inversion Methods," Mathematical Finance, 7, 345-358.

SINGLETON, K. (2000): "Estimation of Affine Diffusion Models Based on the Empirical Characteristic Function," forthcoming in the Journal of Econometrics.

VAsiCEK, O. (1977): "An Equilibrium Characterization of the Term Structure," Journal of Financial Economics, 5, 177-188.

WILLIAMs, D. (1991): Probability with Martingales. Cambridge: Cambridge University Press.

---

This content downloaded from 178.250.250.21 on Thu, 14 Jul 2016 22:31:35 UTC All use subject to http://about.jstor.org/terms

<!-- Page:34 -->