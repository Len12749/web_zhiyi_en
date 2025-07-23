# Jumps and Stochastic Volatility: Exchange Rate Processes Implicit in Deutsche Mark Options

David S. Bates
University of Pennsylvania and National Bureau of
Economic Research
An efficient method is developed for pricing
American options on stochastic volatility/jumpdfJ:
tusion processes under systematic jump and
volatility risk. The parameters implicit in
deutsche mark (DM) options of the model and
various submodels are estimated over the period
1984 to 1991 via nonlinear generalized least
squares, and are tested for consistency with
$/DM futures prices and the implicit volatility
sample path. The stochastic volatility submodel
cannot explain the "volatility smile" evidence of
implicit excess kurtosis, except under parameters
implausible given the time series properties
of implicit volatilities. Jump fears can explain
the smile, and are consistent with one 8 percent
DM appreciation "outlier" observed over the period
1984 to 1991.
The central empirical issues in option pricing are what
distributional hypotheses are consistent with observed
option prices, and whether those distributional hypotheses
are consistent with the properties of the un-

----

I am indebted to Sandy Grossman, Rohert Hodrick, Craig Lewis, William
Perraudin, Rob Stambaugh, Louis Scott, and the anonymous referee for
helpful comments on earlier versions of this article. I would also like to
thank seminar participants at the Wharton School, the Board of Governors,
the New York Federal Reserve, the University of Georgia, the January
1993 AFA meetings, and the 1993 WFA meetings. Financial support from
the Geewax-Terker Research Program in Financial Instruments, from the
Weiss Center for International Financial Research, and from the National
Science Foundation is gratefully acknowledged. Address correspondence
to David S. Bates, The Wharton School, Suite 2300, University of Pennsylvania,
Philadelphia, PA 19104-6367.

<!-- Page:0 -->

derlying asset price. For foreign currency options, the evidence amasse from time series analyses and from option prices regarding the conditional and unconditional moments of exchange rate processes appears qualitatively in agreement. It is undisputed that volatility is timevarying, as evinced in plots of implicit volatilities over time and in the extensive literature On ARCH and GARCH models.$^{1}$ Time series studies also indicate that the unconditional distribution of log-differenced exchange rates is leptokurtic, and that there is an inverse relationship between excess kurtosis and the length of the holding period.$^{2}$ Conditional leptokurtosis has also been found in time series studies (e.g., fat-tailed residuals from ARCH/GARCH models), while the "volatility smile," or U-shaped pattern of implicit volatilities across different strike prices, indicates conditional leptokurtosis implicit in option prices.$^{3}$ The evidence regarding unconditional and conditional skewness is more mixed, with time series estimates sensitive to the currency and period used. Studies of option prices have found evidence of substantial positive implicit skewness in options on foreign currencies during the period 1983 to 1985, but there is less evidence during more recent periods.$^{4}$

Different time series and option pricing models have been employed to capture these salient distributional features. Assorted stationary fat-tailed distributions such as the stable Paretian [Westerfield (1977)], Student's $t$ [Rogalski and Vinso (1978)] and jump diffusions [Akgiray and Booth (1988)] have improved on the unconditional distribution relative to a Gaussian benchmark. Foreign currency option pricing equivalents include Borensztein and Dooley's (1987) use of the Cox and Ross (1976) pure-jump model, Jorion's (1988) and Bates's (1994) use of Merton's (1976) jump diffusion model, and McCullough's (1987) stable distribution model for log-differenced exchange rates. ARCH/GARCH time series models used to capture the timevarying variances and some--though not all—-of the leptokurtosis have stochastic volatility option pricing counterparts, such as Ches

---

$^{1}$ Bollerslev, Chou, and Kroner (1992) provide an excellent survey of the ARCH/GARCH literature, including the applications to foreign exchange rates. $^{2}$ For instance, Hsieh (1988) estimated unconditional kurtosis of 12.8 for daily changes in the \$/DM exchange rates, while Meese (1986) estimated kurtosis of 4.2 for monthly returns. $^{3}$ Ben Khelifa (1991), Cao (1992), and Shastri and Wethyavivorn (1987) document the volatility smile present in foreign current option prices. Model-specific daily esimtaes of implicit distributions in Bates (1994) found excess kurtosis in options on DM and yen futures over the period 1984 to 1992. $^{4}$ Bodurtha and Courtadon (1987) document the tendency of an American option version of the Black and Scholes model to overprice in- and at-the-money calls and underprice out-of-the-money calls on foreign currencies during the period 1983 to 1985, indicating an implicit distribution more positively skewed than the lognormal. Bates (1994), using a jump-diffusion model, found substantial positive implicit skewness in options on deutsche mark futures during the period 1984 to 1986, but not from 1987 to 1992.

<!-- Page:1 -->

ney and Scott (1989), Melino and Turnbull (1990), and Cao (1992). More recent approaches in the time series literature have tended to combine fat-tailed independent shocks and time-varying variances; for instance the Student's t/GARCH model of Baillie and Bollerslev (1989) and the jump diffusion/ARCH model of Jorion (1988).

This article presents an exchange rate model that is potentially compatible with observed option pricing moneyness and maturity biases and with the distributional properties of log-differenced exchange rates. Extending the Fourier inversion option pricing methodology of Stein and Stein (1991) and Heston (1993), a tractable and efficient model for pricing American options on combined stochastic volatility/jump-difusion processes in the presence of systematic volatility and jump risk is developed. By nesting the two skewed and leptokurtic distributions, which of the two better explains the skewness and excess kurtosis implicit in option prices can be examined.

This article also develops methods for testing the consistency of the distributions implicit in option prices with the underlying time series properties of exchange rates and implicit volatilities. In contrast to previous work [see, e.g., Cao (1992), Chesney and Scott (1989), Jorion (1988), and Melino and Turnbull (1990)], the essential orientation of this article is to see whether the distributional anomalies implicit in option prices are apparent in the underlying time series, rather than examining whether non-Gaussian and nonindependent properties of the time series process are reflected in option prices. Since the central issue is the consistency between options and time series, either approach is, of course, valid. However, using implicit distributions potentially exploits a richer information set than that available from time series analysis. For instance, implicit volatilities from option prices should theoretically summarize all relevant information regarding expected future volatilities, whereas univariate ARCH and GARCH approaches can exploit only the subset of that information inferrable from the past history of asset prices. Equally, option prices should reflect any perceptions of low-frequency, large-amplitude jump risk, whereas time series studies lack the power in the small samples typically available to reliably pick up any low-frequency jump component.

Two tests of the consistency between option prices and time series are developed. First, the compatibility of the stochastic volatility process implicit in option prices with time series properties of implicit volatilities is tested. The test includes the issue raised by Stein (1989) and Campa and Chang (1995) as to whether the term structure of implicit volatilities is consistent with observed mean reversion in implicit volatilities. Broader distributional compatibilities (most importantly with regard to the volatility of volatility) can also be examined. A careful distinction is drawn in the tests between the “risk neutral

<!-- Page:2 -->

distributions implicit in option prices and the actual distributions relevant for time series analysis.

Second, the conditional distributions implicit in $\$/\mathrm{DM}$ option prices are tested for consistency with observed changes in log-differenced $\$/\mathrm{DM}$ futures prices. The test parallels standard tests of the forecasting power of implicit volatilities for future volatility, while also allowing examination of higher moments.

Section 1 presents the postulated stochastic volatility/jump-diffusion process for the $\$/\mathrm{DM}$ exchange rate, and discusses the methodology for pricing American options when volatility risk and jump risk are systematic. The Philadelphia Stock Exchange foreign currency options data are discussed in Section 2, and implicit parameter estimates are presented. Tests of compatibility with the underlying implicit volatilities and $\$/\mathrm{DM}$ futures prices are conducted in Section 3. Section 4 concludes.

## 1. A Proposed Stochastic Volatility/Jump-Diffusion Model

The following assumptions will be maintained throughout this article:

1. Markets are frictionless: there are no transactions costs or differential taxes, trading can take place continuously, and there are no restrictions on borrowing or selling short.

2. The instantaneous risk-free interest rate, $r$ and domestic/foreign interest differential, $b=r-r^{*}$, are known and constant.

3. The exchange rate, $S\left(\$/D M\right)$, follows a geometric jump diffusion with the instantaneous conditional variance, $V_{t}$, following a mean-reverting square root process:

$$
\begin{aligned} dS/S &= (\mu - \lambda \bar{k})dt + \sqrt{V} dZ + k dq \\ dV &= (\alpha - \beta V)dt + \sigma_v \sqrt{V} dz_v \\ (dZ, dZ_v) &= \rho dt \end{aligned}
$$

where $\mu$ is the instantaneous expected rate of appreciation of the foreign currency, $\lambda$ is the annual frequency of jumps, $k$ is the random percentage jump conditional on a jump occurring, and $q$ is a Poisson counter with intensity $\lambda$

The postulated exchange rate process offers a rich and flexible distributional structure. Skewed distributions can arise either because of correlations between exchange rate or volatility shocks, or because of nonzero average jumps. Similarly, excess kurtosis can arise either from volatile volatility or from a substantial jump component. Furthermore, the two alternate explanations for skewness and excess kurtosis can

<!-- Page:3 -->

be distinguished by holding period effects. Stochastic volatility implies a direct relationship between the length of the holding period and the magnitude of conditional skewness and excess kurtosis, whereas jumps imply a strong inverse relationship.

The above process for volatility has been used for pricing options under two polar assumptions about interest rate processes. Bailey and Stulz (1989) and Bossaerts and Hillion (1993) price stock index and stock options using the Cox, Ingersoll, and Ross (1985) general equilibrium production economy, which implies instantaneous conditional variances and interest rates are proportional and follow the square root process above. On the other hand, Hull and white (1988) and Heston (1993) price options off the above stochastic volatility process under the more tractable assumption of constant interest rates. Since Scott (1993) finds that interest rate volatility has little impact on short-term option prices such as those examined in this study, the latter assumption of constant domestic and foreign interest rates will be maintained in this study.

The square root variance process has two major advantages. First, the model can allow for systematic volatility risk, whereas alternate processes such as Hull and white (1987) have had to impose the assumption of nonsystematic volatility risk to generate a tractable option pricing model. If the true process is given by Equation (1), then in a representative agent production economy [see Bates (1988)] the risk neutral processes used in pricing options that incorporate the appropriate compensation for jump risk and volatility risk are given by

$$
\begin{align} 
dS/S &= (b - \lambda * k^*)dt + \sqrt{V}dZ^* + k^*dq^* \nonumber\\ 
dV &= [\alpha - \beta V + \Phi_v]dt + \sigma_v\sqrt{V}dZ_v^* \nonumber\\ 
\mathrm{cov}(dZ^*, dZ_v^*) &= \rho dt \nonumber\\ 
\mathrm{prob}(dq^* = 1) &= \lambda^* dt, \quad k \sim (\bar{k}^*, \mathrm{Var}(k^*)) 
\tag{2}
\end{align}
$$

where $^{b}$ is the continuously compounded domestic/foreign interest differential, and starred variables represent the risk-adjusted versions of the true variables, taking into account the pricing of jump risk and volatility risk. In particular,

$$
\begin{align*} 
\Phi_{v} &= \operatorname{cov}\left(dV, \frac{dJw}{Jw}\right) \\ 
\lambda^{*} &= \lambda \, E\left(1 + \frac{\Delta Jw}{Jw}\right) \\ 
\bar{k}^{*} &= \bar{k} + \frac{\operatorname{cov}(k, \Delta Jw / Jw)}{E[1 + \Delta Jw / Jw]}, 
\tag{3}
\end{align*}
$$

<!-- Page:4 -->

where $J_{w}$ is the marginal utility of dollar wealth of the world-average representative investor, $\Delta J_{w}/J_{w}$ is the random percentage jump conditional on a jump occurring, and $d J_{w}/J_{w}$ is the percentage shock in the absence of jumps.[^5] As usual, time-separabie isoelastic utility is a convenient assumption to make at this stage, and implies that the volatility risk premium, $\Phi_{\upsilon}=f(V)$, depends only on $V$ $\ln(1+k^{*})$ is normally distributed with the same variance $\delta^{2}$ as the actual jumps, and $\lambda^{*}$ and $\bar{k}^{*}$ are constant.[^6]

A no-arbitrage constraint on the functional form of the volatility risk premium $\Phi_{\nu}(V)$ is that $\Phi_{\nu}(0)=0$.[^8] This restriction precludes modeling the volatility risk premium as proportional to $\operatorname{ln}(V)$ when the log of volatility follows an Ornstein-Uhlenbeck process and necessitated Hull and white's (1987) assumption of nonsystematic volatility risk( $\Phi_{\nu}\equiv0)$ for analytic tractability. In the case of the square root volatility process, however, the volatility risk premium can plausibly be modeled as proportional to the conditional variance $V_{t}$

$$
\Phi_v(V) = \xi V. \tag{4}
$$

The result is that the risk neutral process for the instantaneous conditional variance resembles the true process in form:

$$
dV = (\alpha - \beta V + \xi V) dt + \sigma_v \sqrt{V} dz_v^* \\ \equiv (\alpha - \beta^* V) dt + \sigma_v \sqrt{V} dz_v^*. \tag{5}
$$

---

[^5]: Issues of heterogenous international investors and deviations from purchasing power parity, which would involve including additional state variables for the distribution of weaith across heterogeneous agents, are being ignored here. More precisely, such effects are assumed here to affect only the foreign currency risk premium $E(d S/S)^{-}-(r-\dot{r}^{*})=\mu-b$ and therefore have no effect on option prices. The potential general equilibrium effects of the omitted state variables on interest rates and on volatility are ruled out by the imposed distributional assumptions. For an illustration of the (limited) general equilibrium impact of investor heterogeneity on interest rates see Dumas (1989).

[^6]: The specification of the risk neutral process depends on the choice of numeraire. The above specification of Equations (2) and (3) is the risk neutral process for the $\$/\mathsf{FC}$ exchange rate $s$ to be used in generating dollar-denominated prices of foreign currency options. For foreign-currency denominated option prices expressed in terms of the $\mathbf{FC}/\S$ exchange rates $1/S$, it is necessary to use the marginal utility of foreign-currency denominated wealth $\bar{J_{u},*}=S\bar{J_{u}}$, when computing $\Phi_{\nu}$, $\lambda^{*}$, and $\bar{k}^{\star}$. An Ito's lemma-based transformation of variables of the process in Equation (2) using $z\equiv S^{-1}$ is not correct, because of Siegel's paradox.

[^7]: The additional restriction that the process for optimally invested wealth follows a geometric volatility/jump-diffusion process with constant parameters is also required. See Ingersoll(1987, chap. 18) for a discussion of a similar issue with regard to the term structure of interest rates.

[^8]: Strict linearity of the volatility risk premium can be supported under log utility when exchange rate volatility and market risk have a common component of a particular form. The linear specification will not typically emerge under more general preferences (e.g.,time-separable power utility) and should be viewed for such preferences as an approximation to the true functional form. Cox, Ingersoll, and Ross (1985) use a similar approximation when modeling the risk premium on interest rates.

<!-- Page:5 -->

Note, however, that the variance steady-state level $(\alpha/\beta^{*})$ and rate of mean reversion $\beta^{*}$ implicit in option prices are not the true levels, but differ by an amount that depends on the volatility risk premium.

The second major advantage to the square root process for variance is that the process generates an analytically tractable method of pricing options without sacrificing accuracy or requiring undesirable restrictions (such as $\rho=0,$ ) on parameter values. European options that can be exercised only at maturity are priced as the expected value of their terminal payoffs under the risk neutral probability measure:

$$
c = e^{-rT} E^* \max(S_T - X, 0) \\ = e^{-rT} \left[ \int_X^\infty S_T p^*(S_T) dS_T - X \int_X^\infty p^*(S_T) dS_T \right] \\ = e^{-rT} (FP_1 - XP_2) \tag{6}
$$

where $E^{*}$ is the expectation with respect to the risk-neutral probability measure; $F=\bar{E^{*}}(S_{T})=S_{0}e^{b T}$ is the forward price on foreign currency; $P_{2}=\text{prob}^{*}(S_{T}>X)$ is one minus the risk neutral distribution function; and $P_{1}=\int_{X}^{\infty}[S_{T}/E^{*}(S_{T})]p^{*}(S_{T})d S_{T}$ is also a probability (since the integrand is nonnegative and the integral over $\lbrack0,\infty)$ is one). For instance, the Garman and Kohlhagen (1983) variant of the Black and Scholes formula for foreign currency options under the assumption of constant-volatility geometric Brownian motion for the exchange rate is

$$
c = e^{-rT} [FN(d_1) - XN(d_2)] \tag{7}
$$

where d = [ln(F/X) + o2T]/o√T, and d2 = d - α√T.

The European option evaluation problem is to evaluate $P_{1}$ and $P_{2}$ under the distributional assumptions embedded in the risk neutral probability measure. The difficulty is that the cumulative distribution function for most distributions is messy and, in many cases, we do not have any idea of what it looks like. Even the Black and Scholes

<!-- Page:6 -->

model has a distribution related to the error function, which is nontrivial to evaluate. When it comes to stochastic volatility models, the distribution function is unknown. The difficulty in evaluating $P_{1}$ and $P_{2}$ is responsible for a bias toward series solutions for pricing options. 

Heston (1993) pointed out that it is much easier to solve for the moment generating functions associated with $P_{1}$ and $P_{2}$ . Essentially one can view the moment generating function as a contingent claim to be solved using the standard contingent claims' partial differential equation under relatively easy boundary conditions; details are in the Appendix. (The P's also solve the equation--subject, however, to discontinuous boundary conditions that preclude easy solutions.) Once one has the moment generating function, there exist fast numerical procedures for evaluating Pi and P2. The resulting moment generating functions of $\ln(S_{T}/S_{0})$ for the two probabilities $P_{1}$ and $P_{2}$ when exchange rates follow a combination stochastic volatility/jump-diffusion process are given by

$$
F_j(\Phi \mid V, T) \equiv E[e^{\Phi \ln(S_T/S_0)} \mid P_j] \qquad (j = 1, 2) \\ = \exp\{C_j(T; \Phi) + D_j(T; \Phi)V + \lambda^* T (1 + \bar{k}^*)^{\mu_j + 1/2} \\ \times [(1 + \bar{k}^*)^\Phi e^{\delta^2(\mu_j \Phi + \phi^2/2)} - 1]\} \tag{8}
$$

where

$$
C_j(T; \Phi) = (b - \lambda^* \bar{k}^*) \Phi T - \frac{\alpha T}{\sigma_v^2} (\rho \sigma_v \Phi - \beta_j - \gamma_j) - \frac{2 \alpha}{\sigma_v^2} \ln \left[ 1 + \frac{1}{2} (\rho \sigma_v \Phi - \beta_j - \gamma_j) \frac{1 - e^{\gamma_j T}}{\gamma_j} \right], \tag{9}
$$

$$
D_j(T; \Phi) = -2\frac{\mu_j \Phi + \frac{1}{2} \Phi^2}{\rho \sigma_v \Phi - \beta_j + \gamma_j \frac{1+e^{\eta_j T}}{1-e^{\eta_j T}}}, \tag{10}
$$

$$
Y_j = \sqrt{(\rho \delta_v \Phi - \beta_j)^2} - 2 \delta_v (\mu_j \Phi + \frac{1}{2} \Phi), \tag{11}
$$

$$
\mu_{1} = +\frac{1}{2}, \mu_{2} = -\frac{1}{2}, \beta_{1} = \beta^{*} - \rho\sigma_{v}, \text{ and } \beta_{2} = \beta^{*}.
$$

Given the above solutions for the moment generating functions, the relevant tail probabilities $P_{j}(\Phi\mid S_{0},T)=j r{\tilde{o}}b^{*}(S_{T}e^{b\Delta{\tilde{t}}_{1}}>X\mid F_{j})$ for evaluating PHLX options can be determined numerically via Fourier inversion of the complex-valued characteristic function $F_{j}(i\Phi\mid S_{0},T)$

$$
\operatorname{prob}^*(S_T e^{b\Delta t_i} > X \mid F_j) = \frac{1}{2} + \frac{1}{2\pi} \int_{-\infty}^{\infty} \frac{F_j(i\Phi)e^{-i\Phi x}}{i\Phi} d\Phi \tag{12}
$$

where $x\equiv\ln(X e^{-b\Delta t_{1}}/S_{0})$ and $\Delta t_{1}=5/365$ is the lag between the last

<!-- Page:7 -->

trading day and the delivery day on PHLX options. By the properties of characteristic functions, the integral is real-valued and the probability can also be written as[^1] 

$$
prob^*(S_T e^{b \Delta t_1} > X \mid F_j) = \frac{1}{2} + \frac{1}{\pi} \int_0^{\infty} \frac{\text{imag}[F_j(i \Phi) e^{-i \Phi x}]}{\Phi} \, d\Phi. \tag{13}
$$

The probability density function of $\ln(S_{T}/S_{0})$ under the risk neutral probability measure has a similar form: 

$$
p^{*}(z) = \frac{1}{2\pi} \int_{-\infty}^{\infty} F_2(i\Phi) e^{-i\Phi z} \, d\Phi \\ = \frac{1}{\pi} \int_{0}^{\infty} \text{real}[F_2(i\Phi) e^{-i\Phi z}] \, d\Phi \tag{14}
$$

where $z\equiv\ln(S_{T}/S_{0})$ 

The integrals in Equations (13) and (14) can be evaluated efficiently via Gaussian quadrature. A Gauss-Kronrod rule based on IMSL subroutine DQDNG that evaluated $F_{j}(i\Phi)$ at up to 87 points over a truncated domain was found to be accurate to $10^{-8}$ times the spot exchange rate (four orders of magnitude less than the minimum price change), except for extreme and implausible jump parameters. Since pricing call and put options of a common maturity and variance require the same values of $F_{j}(i\Phi)$ regardless of the strike price/spot price ratio, enormous efficiency gains can be realized by evaluating all such options simultaneously. 

The above procedure gives the price of a European option as a function of state variables and parameters: 

$$
c(S, V, T; X, \theta) = e^{-r(T+\Delta t_i)} [FP_1 - XP_2] \tag{15}
$$

for $\theta=\langle\lambda^{*},\bar{k}^{*},\delta,\alpha,\beta^{*},\sigma_{\nu},\rho\rangle$ . However, since the PHLX options on foreign currency are American, it is important, in principle, to take into account the extra value accruing from the ability to exercise the options prior to maturity. This study uses the constant-volatility analytic approximation from Bates (1991) for jump diffusions, modified forthe $4$ business day lag between early exercise of a PHLX option

---

The real part of $F(i\Phi)$ is an even function of $\Phi$ the imaginary part is an odd function. Inversion formulas are discussed in Kendall, Ord, and Stuart (1987, vol. 1, chap. 4).

Extreme values of $\bar{\pmb{k}}$ (e.g., 30,000 percent) made $F(i\Phi)$ highly oscillatory, and reduced accuracy to $10^{-5}\times S$,which is still an order of magnitude less than the minimum tick size. Accuracy was measured by comparing option prices with those evaluated to $10^{-10}$ accuracy using IMSL's adaptive Gaussian quadrature subroutine DQDAGI for integrating functions over a semi-infinite domain.

<!-- Page:8 -->

and delivery of the underlying currency: 

$$
P(S, V, T; X) \approx  \begin{cases}  p(S, V, T; X) + XA_1 \left(\dfrac{S/X}{y_p^*}\right)^{q_1} & \text{for } S/X \geq y_p^* \\ e^{-r\Delta t_2}(X - Se^{b\Delta t_2}) & \text{for } S/X < y_p^* \end{cases} \tag{16}
$$

$$
C(S, V, T; X) \approx \begin{cases}  c(S, V, T; X) + XA_2 \left(\dfrac{S/X}{y_c^*}\right)^{q_2} & \text{for } S/X < y_c^* \\ e^{-r\Delta t_2}(Se^{b\Delta t_2} - X) & \text{for } S/X \geq y_c^*  \end{cases} \tag{17}
$$

where $\Delta t_{2}$ is the delivery lag on early exercise (4/365 if Monday, 6/365 otherwise);

$$
A_1 = e^{-r\Delta t_2}(1 - y_p^* e^{b\Delta t_2}) - p(y_p^*, V, T; 1);
$$

$q_{1}$ and $q_{2}$ are the negative and positive roots to

$$
\frac{1}{2} \bar{V} q^{2} + \left( b - \lambda^{*} \tilde{k}^{*} - \frac{1}{2} \bar{V} \right) q - \frac{r}{1 - e^{-rT}} + \lambda^{*} \left[ (1 + \tilde{k}^{*}) q e^{\frac{1}{2} q (q-1) \delta^{2}} - 1 \right] = 0 \tag{18}
$$

$\bar{V}$ is the expected average variance over the lifetime of the option conditional on no jumps:

$$
\bar{V} \equiv \frac{1}{T} E \int_{0}^{T} V_{t} \, dt = \frac{\alpha}{\beta^{*}} + \left( V_{0} - \frac{\alpha}{\beta^{*}} \right) \frac{1 - e^{-\beta^{*}T}}{\beta^{*}T} \tag{19};
$$

$y_{p}^{*}$ , the critical spot price/strike price ratio for immediate exercise of puts, is given implicitly by

$$
e^{-r\Delta t_2}(1-y_p^*e^{b\Delta t_2}) = p(y_p^*, V, T; 1)-\left(\frac{y_p^*}{q_1}\right) [e^{(b-r)\Delta t_2}+p_s(y_p^*, V, T; 1)] \tag{20}
$$

and $y_{c}^{*}$ , the critical spot price/stike price ratio for immediate exercise of calls, is given by

$$
e^{-r\Delta t_2}(y_c^* e^{b\Delta t_2}-1) = c(y_c^*, V, T; 1)+\left(\frac{y_c^*}{q_2}\right)[e^{(b-r)\Delta t_2}-c_s(y_c^*, V, T; 1)]. \tag{21}
$$

Strictly speaking, the approximations for the early exercise premiums were derived for constant-volatility jump diffusions. A comparison with option prices computed via finite-difference methods (see Table 1) revealed a maximal approximation error of around $0.01\Phi/\mathrm{DM}$ (one price tick) for in-the-money put options. The approximation error is substantially smaller for shorter-maturity put options and for puts with different strike prices. Approximation error is negligible for call options of all maturities considered, given U.s. interest rates substantially higher than German rates over most of the data sample.

---

78

<!-- Page:9 -->

Iumps and Stochastic Volatility: Exchange Rate Processes Implicit in Deutsche Mark Options

Since the data set considered below consists predominantly of short maturity at- and out-of-the-money options and contains relatively few in-the-money puts, approximation error in the put early exercise premium was not felt to be of major concern.

## 2. Estimation

### 2.1 Data

Transactions data for deutsche mark foreign currency options were obtained for January 1984 to June 1991 from the Philadelphia Stock Exchange. Prior to September 26, 1987, only options maturing in March, June, September, or December were traded, with contract specifications geared to the corresponding IMM foreign currency futures contracts in size (62,500 deutsche marks, half the size of the IMM futures contracts) and maturity (third Wednesday of the contract month). Trading in contracts maturing the nearest other two months began on September 27, 1987. The options are American, and could be exercised at any time up to and including the Saturday preceding the third Wednesday of the contract month.

Roughly 1 percent of the records mildly violated early exercise constraints, presumably due to measurement error in matching up the underlying futures price. Since discarding these data would bias upward average in-the-money option prices, influencing the implicit parameter estimation, these data were retained. There was also no attempt to weed out thinly traded option contracts, apart from the fact that those contracts by their nature received a low weighting in the regressions. A few obviously erroneous data (0.1 percent of the total data) were discarded.

Only a subset of the full data set was used in this study. First, only trades on Wednesdays were considered, yielding a weekly frequency panel data set. Daily sampling would place extreme demands on computer memory and time, and would involve issues of modeling day-of-the-week volatility effects that I do not wish to explore at this time. Second, only morning trades (9 A.M. to 12 P.M. EST) were considered—a trade-off between shortening the interval for greater synchronicity and lengthening it to get more observations. Third, only options with March/June/September/December maturities and with 6 months or less to maturity were used—for a maximum of two option maturities per day. The resulting data set consists of 19,689 transactions (11,952 calls; 7,737 puts) on 372 Wednesday mornings.

---

14 Fifty percent of the daily trades over the period 1984 to 1991 took place between 9 A.M. and 12 P.M. The greatest activity was between 9 A.M. and 10:30 A.M., when U.S. and European markets were open simultaneously.

<!-- Page:10 -->

<center><i>Table 1 Prices of European and American put options in <img src="https://latex.codecogs.com/svg.image?\phi/\mathbf{DM}" style="vertical-align: middle; height: 1.2em;" alt="\phi/\mathbf{DM}" class="latex-formula"/> evaluated by Fourier, finite-difference, and quadratic approximation method.  Strike prices (t/DM) </i></center>

| Parameters | Options | 38 | 39 | 40 | 41 | 42 |
|------------|---------|----|----|----|----|----|
| $\alpha/\beta^* = .0225, \sigma_v = .15, \rho = 0$ | $P_{\text{Fourier}}$ | .374 | .662 | 1.074 | 1.617 | 2.283 |
| $\lambda^* = \bar{k}^* = \delta = 0$ | $P_{\text{approx}}$ | .381 | .673 | 1.093 | 1.648 | 2.333 |
| $V_0 = .0225$ | $P_{FD}$ | .379 | .672 | 1.095 | 1.653 | 2.343 |
|  | $(P_{\text{approx}} - P_{FD})$ | (.002) | (.001) | (-.002) | (-.005) | (-.009) |
| $\alpha/\beta^* = .0225, \sigma_v = .15, \rho = 0$ | $P_{\text{Fourier}}$ | .575 | .902 | 1.334 | 1.874 | 2.515 |
| $\lambda^* = \bar{k}^* = \delta = 0$ | $P_{\text{approx}}$ | .583 | .915 | 1.353 | 1.903 | 2.557 |
| $V_0 = 0.04$ | $P_{FD}$ | .582 | .916 | 1.358 | 1.911 | 2.571 |
|  | $(P_{\text{approx}} - P_{FD})$ | (.001) | (-.001) | (-.005) | (-.008) | (-.014) |
| $\alpha/\beta^* = .0225, \sigma_v = .30, \rho = 0$ | $P_{\text{Fourier}}$ | .369 | .648 | 1.056 | 1.601 | 2.274 |
| $\lambda^* = \bar{k}^* = \delta = 0$ | $P_{\text{approx}}$ | .376 | .659 | 1.074 | 1.631 | 2.322 |
| $V_0 = .0225$ | $P_{FD}$ | .374 | .658 | 1.077 | 1.638 | 2.335 |
|  | $(P_{\text{approx}} - P_{FD})$ | (.002) | (.001) | (-.003) | (-.007) | (-.013) |
| $\alpha/\beta^* = .0225, \sigma_v = .15, \rho = .1$ | $P_{\text{Fourier}}$ | .369 | .658 | 1.074 | 1.621 | 2.289 |
| $\lambda^* = \bar{k}^* = \delta = 0$ | $P_{\text{approx}}$ | .375 | .669 | 1.092 | 1.650 | 2.337 |
| $V_0 = .0225$ | $P_{FD}$ | .373 | .668 | 1.094 | 1.655 | 2.347 |
|  | $(P_{\text{approx}} - P_{FD})$ | (.002) | (.001) | (-.002) | (-.005) | (-.010) |
| $\alpha/\beta^* = .0125, \sigma_v = .20, \rho = 0$ | $P_{\text{Fourier}}$ | .356 | .619 | 1.018 | 1.567 | 2.252 |
| $\lambda^* = 2, \bar{k}^* = 0, \delta = .07$ | $P_{\text{approx}}$ | .365 | .633 | 1.039 | 1.600 | 2.305 |
| $V_0 = .0125$ | $P_{FD}$ | .360 | .626 | 1.030 | 1.588 | 2.292 |
|  | $(P_{\text{approx}} - P_{FD})$ | (.005) | (.007) | (.009) | (.011) | (.012) |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>Approximate American option prices <img src="https://latex.codecogs.com/svg.image?(P_{a%20p%20p%20r%20o%20x})" style="vertical-align: middle; height: 1.2em;" alt="(P_{a p p r o x})" class="latex-formula"/> were generated using Fourier European option prices plus a quadratic approximation for the early exercise premium, ignoring delivery lags <img src="https://latex.codecogs.com/svg.image?(\Delta%20t_{1}=\Delta%20t_{2}=0)" style="vertical-align: middle; height: 1.2em;" alt="(\Delta t_{1}=\Delta t_{2}=0)" class="latex-formula"/> for values in this table. Finite-difference American put option prices <img src="https://latex.codecogs.com/svg.image?(P_{F%20D}^{-})" style="vertical-align: middle; height: 1.2em;" alt="(P_{F D}^{-})" class="latex-formula"/> were evaluated using a bivariate explicit finite-difference method influenced by Omberg (1988), with three-point "sharpened" Hermite and generalized Laguerre quadrature over <img src="https://latex.codecogs.com/svg.image?\bf{l%20n}(S)" style="vertical-align: middle; height: 1.2em;" alt="\bf{l n}(S)" class="latex-formula"/> and <img src="https://latex.codecogs.com/svg.image?V" style="vertical-align: middle; height: 1.2em;" alt="V" class="latex-formula"/> lattice points, respectively. Jump-contingent expected values were evaluated by nine-point Hermite quadrature. Finite-difference American option prices were subsequently adjusted for observed biases in European prices using the control variate technique. Comparison of Fourier inversion and finite-difference European put option prices <img src="https://latex.codecogs.com/svg.image?(p_{F%20o%20u%20r%20i%20e%20r}" style="vertical-align: middle; height: 1.2em;" alt="(p_{F o u r i e r}" class="latex-formula"/> versus <img src="https://latex.codecogs.com/svg.image?p_{F%20D})" style="vertical-align: middle; height: 1.2em;" alt="p_{F D})" class="latex-formula"/> indicated the finite-diference method was accurate to <img src="https://latex.codecogs.com/svg.image?{0030}/{\mathrm{DM}}" style="vertical-align: middle; height: 1.2em;" alt="{0030}/{\mathrm{DM}}" class="latex-formula"/> for the three-day time gap used. The minimum tick size for deutsche mark options is . <img src="https://latex.codecogs.com/svg.image?010\Phi/\mathrm{DM}" style="vertical-align: middle; height: 1.2em;" alt="010\Phi/\mathrm{DM}" class="latex-formula"/> . Details of the finite-difference methodology are available from the author. </i>
</div>
</center>

<!-- Page:11 -->

over the period January 4, 1984, to June 19, 1991; an average of 53 trades per morning. Not all Wednesdays are included, owing to data collection problems at the Philadelphia Stock Exchange during February 1985, November 1985, and September 1988.[^1] 

Other data needed in pricing foreign currency options include the underlying asset price, a risk-free discount rate, and the domestic/foreign interest rate differential. Transaction prices for IMM foreign currency futures were obtained from the Chicago Mercantile Exchange, and the nearest preceding futures price of comparable or shorter maturity was used as the underlying asset price--provided the lapsed time was less than 5 minutes. Otherwise the option record was discarded. The futures data appeared of higher quality than the Telerate time-stamped spot exchange rate quotes provided by the Philadelphia Stock Exchange. Daily 3-month Treasury bill yields were used for the risk-free discount rate. The daily domestic/foreign interest rate differential was inferred and interpolated from synchronously recorded spot rates and 1- and 3-month forward rates, using covered interest parity and adjusting for weekend and end-of-month effects on the maturity of the forward contract.[^2] 

### 2.2 Unconstrained implicit parameter estimation methodology

Implicit parameters were initially estimated on the panel data set of call and put prices for all observed strike prices and at most two quarterly maturities on Wednesday mornings over the period January 4, 1984, to June 19, 1991. The option pricing residual was defined as

$$
e_{i,t} \equiv \left(\frac{O}{S}\right)_{i,t} - O\left(1, V_t, T_{i,t}; \left(\frac{X}{S}\right)_{i,t}, \theta\right) \tag{22}
$$

where t is an index over 372 Wednesday mornings within the specified period; i is an index over transactions (calls and puts of assorted strike prices and at most two quarterly maturities) on a given Wednesday morning; $(O/S)_{i,t}$ is the observed call or put option price/spot price ratio for a given transaction, using an implicit spot from a synchronous futures transaction; and $O(\cdot)$ is the theoretical American option price/spot price ratio given the contractual terms of the option (call/put, time to maturity $T_{i,t}$, strike price/spot price ratio $(X/S)_{i,t})$ and given Wednesday morning's instantaneous variance V, interest

---

15 An oddity of the Philadelphia Stock Exchange database is that prior to September 28, 1984, every record appears twice.The duplicatedatawere discarded. 16 I am indebted to Sandy Grossman for providing the interest and exchange rate data.

<!-- Page:12 -->

rate $r_{t}$ and interest differential $b_{t}=r_{t}-r_{t}^{*}$, and the time-invariant parameters $\theta$ of the model.

For the full stochastic volatility/jump-diffusion model, $\theta$ was the set of jump and stochastic volatility parameters: $\theta=\langle\lambda^{*},\bar{k}^{*},\delta,\alpha,\beta^{*},\sigma_{\upsilon},\rho\rangle$

The following subcases of the general model were also estimated, in order to see which features of the generalized model were important in explaining option pricing deviations from benchmark Black-Scholes prices:

1. Black-Scholes model (Bs), American option version, with the same implicit volatility for all maturities on a given day; estimated parameters: $\{V_{t}\}$
2. Deterministic volatility model (DV), allowing daily a downward or upward sloping term structure of implicit volatilities (depending on whether $V_{t}\gtrsim\alpha/\beta^{*})$; estimated parameters: $\{V_{t}\},\alpha,\beta^{*}$
3. Deterministic volatility/jump-diffusion model (DvJD), allowing implicit skewness and excess kurtosis inversely related to option maturity; estimated parameters: $\{V_{t}\},\lambda^{*},\bar{k}^{*},\delta,\alpha,\check{\beta}^{*}$
4. Stochastic volatility model (SV), allowing skewness and excess kurtosis directly related to option maturity; estimated parameters: $\{V_{t}\},\alpha,\beta^{*},\sigma_{\upsilon},\rho$
5. Stochastic volatility/jump-diffusion model (SVJD), allowing mixed maturity effects on skewness and excess kurtosis; estimated parameters: $\{\dot{V_{t}}\},\lambda^{*},\bar{k}^{*},\delta,\alpha,\beta^{*},\sigma_{\nu},\rho$

Note that the average Wednesday morning realizations of the instantaneous conditional variance $\{V_{t}\}$ must also be estimated. Intradaily movements in spot variance were ignored in the estimation procedure.

The first three models are inherently ad hoc, in that the restriction that the estimated realizations $\{V_{t}\}$ be drawn from the postulated (degenerate) distribution has not been imposed and is obviously violated. Nonzero parameter estimates are being generated cross-sectionally off the observed moneyness and maturity biases of the option prices relative to Black-Scholes, and not off the time series properties of $\{V_{t}\}$ The separate case in which $V_{t}$ estimates are constrained by the postulated diffusion will be examined below.

Central to estimating implicit parameters is identifying why hypothesized and observed options transactions prices deviate. Bid-ask bounce in transactions with the market specialist suggests that residuals are independent to a first approximation, with moneyness- and maturity-related heteroskedasticity. Imperfect synchronization with the appropriate underlying futures prices equally suggests independent, heteroskedastic residuals. The pooling error introduced by using a common spot variance for all transactions on a given Wednesday morning introduces more complex intradaily serial and cross-correla

<!-- Page:13 -->

tions in residuals that are beyond the scope of this article. A major issue for implicit parameter estimation is, however, specification error. Any parsimonious time series model imposes a structure on option prices that can capture only some of the features of the true data-generating process. Specification error implies that option pricing residuals of comparable moneyness and maturity will be contemporaneously correlated, and serially correlated as well if the conditional risk-neutral distribution evolves gradually over time in fashions not captured by the model. Furthermore, no-arbitrage constraints on option prices imply contemporaneous correlations across residuals of different strike prices and maturities. For instance, put-call parity for the European component of American option prices implies positively correlated residuals between calls and puts of identical moneyness and maturity in the presence of specification error. Consequently, implicit parameter estimation via nonlinear ordinary least squares (NLOLS) would yield misleadingly low estimated standard errors. A further problem when transactions data are used is that NL-OLS places too much weight on the substantially redundant information provided by heavily traded near-the-money options and virtually ignores the less actively traded in- and out-of-the-money options.$^{17}$

Consequently, implicit parameters were estimated using a nonlinear generalized least squares (NL-GLS) methodology modeled on Engle and Mustafa (1992) that takes into account the heteroskedasticity, contemporaneous correlation, and serial correlation properties of option residuals. The residuals were sorted by call/put, maturity, and moneyness criteria into 40 groups,$^{18}$ and were assumed to include both group-specific and idiosyncratic shocks:

$$
\left\{ \begin{array}{l} 
e_{i,t} = \epsilon_{I,t} + \sigma_I \eta_{i,t} \quad \text{for } i \in G_I \\ 
\epsilon_{I,t} = \rho_I \epsilon_{I,t-1} + \nu_{I,t} 
\end{array} \right. \tag{23}
$$

where $I$ is an index across the set of groups $\{G_{I}\};~\nu_{I,t}$ is a mean-zero, normally distributed shock term common to all option prices in group $I$ at time $t$, with $E_{t-1}\nu_{I,t}\nu_{I,t}' = \Sigma$ for positive semidefinite $\Sigma$; and $\eta_{i,t} \sim N(0, 1)$ is an idiosyncratic shock to transaction $i$ at time $t$.

---

17 An earlier version of this article that used NL-OLS estimation appeared in December 1993 as NBER working paper no. 4596, under the same title. Estimates in that article differed substantially from those presented below, in two areas. First, the heavy weight on near-the-money options resulted in implicit jump parameter estimates that were statistically but not economically significant, and had little relevance for the volatility smile. Second, parameter estimation using options and time series data effectively gave extremely heavy weight to fitting the options, and downweighted time series plausibility.

18 The criteria were (1) whether the transaction involved a call or a put; (2) whether the quarterly maturity was short-term (roughly 0 to 3 months) or medium-term (3 to 6 months); and (3) which of 10 alternatives characterized the strike price/futures price ratio: < 0.94, [0.94, 0.96), [0.96, 0.98), [0.98, 0.99), [0.99, 1), [1, 1.01), [1.01, 1.02), [1.02, 1.04), [1.04, 1.06), or ≥ 1.06.

<!-- Page:14 -->

uncorrelated with v1. t. The appropriate loss function for implicit parameter estimation is 

$$
\max_{\{V_t\}, \theta} \ln L_{\text{options}} = \frac{1}{2} \sum_t -N_t \ln(2\pi) - \ln |\Omega_t| - (\boldsymbol{e}_t - E_{t-1} \boldsymbol{e}_t)' \Omega_t^{-1} (\boldsymbol{e}_t - E_{t-1} \boldsymbol{e}_t) \tag{24}
$$

where Ωt is the covariance matrix for the vector of residuals et on a given day, given Equation (23). Since there can be up to 400 transactions per Wednesday morning, computational efficiency is substantially increased by using an orthogonalizing transformation for day- and group-specific residuals: 

$$
\bar{e}_{l,t} \equiv \frac{1}{N_{l,t}} \sum_{t=1}^{N_{l,t}} e_{i,t} \quad \text{for} \ e_{i,t} \in G_I \tag{25}\\ u_{i,t} \equiv e_{i,t} - \bar{e}_{l,t}, \quad i = 1, \ldots, N_{l,t} - 1,
$$

where NI,t is the number of transactions in group I on date t. Under this transformation, Equation (24) can be rewritten as 

$$
\max_{\{V_t\},\theta} \ln L_{\text{options}} = C - \frac{1}{2} \sum_t \{ N_t \ln(2\pi) + \ln |\mathbf{M}_t| + (\nu_t - E_{t-1} \nu_t)' \mathbf{M}_t^{-1} (\nu_t - E_{t-1} \nu_t) \} \tag{26}
$$

where 

$$
C \equiv \frac{1}{2} \Sigma_t \ln |\mathbf{M}_t| - \ln |\mathbf{\Omega}_t| = \Sigma_t \Sigma_I \ln(\max(N_{I,t}, 1)) \text{ is a constant};
$$

Mt has a simple analytic form except for the group-average component, and involves inverting at most a 40 x 40 positive definite matrix per day. The conditional expectation of v was computed using Et-1el,t = (o1)ré1,t-n and Et-1ui,t = O, where n is the number of weeks since the last Wednesday for which observations in group 

---

The diagonal terms of [Eu .u'.1-1 for NI > 1 are 1/o, while the of-diagonal elements are 2/o?. The diagonal terms of E-1(e: - E-{e,)(e, - E-1e,) are Zl1 + o2/NI., while the off-diagonal elements:areE1.j.

<!-- Page:15 -->

$I$ were observed.$^{20}$ For $n>4$ the conditional expectation was set to zero.

Parameters were estimated via sequential maximization of Equation (26) over $\langle\{V_{t}\},\theta\rangle$ and $\langle\pmb{\Sigma},\{\sigma_{I}\},\{\rho_{I}\}\rangle$ , iterated to convergence, with assorted parameter transformations used to increase efficiency or to constrain the parameter space.$^{21}$ Goldfeld, Quandt, and Trotter's quadratic hill-climbing method (GQOPT software, GRADX method) was used for estimating jump-diffusion parameters, while Powell and Davidon-Fletcher-Powell algorithms were used for estimating covariances and correlations. First and second derivatives of the loss function were computed numerically, coded to eliminate irrelevant computations.$^{22}$ Estimates of implicit parameters on the full data set generally took 3 to 5 days on a dedicated Hewlett-Packard Apollo 735 workstation, depending upon which model was used.

### 2.3 Results

Several interesting features emerge from the estimates of the stochastic volatility/jump-diffusion model and assorted submodels shown in Table 2. The deterministic volatility (DV) model's relaxation of the Black-Scholes assumption of a flat term structure of implicit volatilities substantially improved the fit of O- to 3-month near-the-money call and put options, by up to 0.015 percent of the underlying spot exchange rate (roughly one price tick). The fit for 3- to 6-month calls tended to worsen, by up to 0.005 percent, while mixed effects were observed for $3\cdot$ to 6-month puts. The tendency for the term structure of implicit volatilities to be upward (downward) sloping for low (high) short-term implicit volatilities was qualitatively consistent with the postulated volatility mean reversion. NL-GLS estimates of the halflife of volatility shocks based essentially on the average slope of the term structure of implicit volatilities ranged from 6.4 to 10.6 months, depending on whether jumps were not or were included.

Allowing for skewed and/or leptokurtic distributions via the deterministic volatility/jump-diffusion (DVJD), stochastic volatility (SV),

<!-- Page:16 -->

<center><i>Table 2 Implicit parameter estimates for various models </i></center>

| Model | Jump parameters |  |  |  | Stochastic volatility parameters |  |  |  | $\sqrt{\frac{\alpha}{\beta^*}}$ | half-life |  | $\ln L_{\text{options}}$ |
|---|---|:---:|:---:|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
|  | $\lambda^*$ | $\bar{k}^*$ | $\delta$ | $\sqrt{V_{\text{jump}}}$ | $\alpha$ | $\beta^*$ | $\sigma_v$ | $\rho$ | (months) |  |
| BS | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |  | 120,345.89 |
| DV | 0 | 0 | 0 | 0 | .020 | 1.20 | 0 | 0 | .130 | 6.9 | 120,396.54 |
|  |  |  |  |  | (.001) | (.001) |  |  | (.002) | (.1) |  |
| DVJD | .76 | .006 | .077 | .067 | .007 | .98 | 0 | 0 | .085 | 8.4 | 120,583.16 |
|  | (.01) | (.000) | (.001) |  | (.001) | (.00) |  |  | (.003) | (.0) |  |
| SV | 0 | 0 | 0 | 0 | .031 | 1.30 | .284 | .045 | .155 | 6.4 | 120,644.45 |
|  |  |  |  |  | (.001) | (.01) | (.005) | (.002) | (.002) | (.1) |  |
| SVJD | 15.01 | -0.001 | .019 | .072 | .019 | .78 | .343 | .078 | .144 | 10.6 | 120,699.27 |
|  | (1.21) | (.000) | (.001) |  | (.001) | (.02) | (.008) | (.003) | (.003) | (.1) |  |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>Nonlinear generalized least squares estimates of the risk-neutral implicit stochastic volatility/jump-diffusion process </i>
</div>
</center>

$$
\begin{align} 
dS/S &= (b - \lambda^* k^*) dt + \sqrt{V} dZ^* + k^* dq^* \\ 
dV &= (\alpha - \beta^* V) dt + \sigma_v \sqrt{V} dZ_v^* \\ 
\text{cov}(dZ^*, dZ_v^*) &= \rho dt 
\end{align}
$$

$$
\text{prob}(dq^* = 1) = \lambda^* dt, \ln(1 + k^*) \sim N(\ln(1 + \bar{k}^*) - \frac{1}{2} \delta^2, \delta^2)
$$

using data on 19,689 call and put prices with 0- to 3-month and 3- to 6-month quarterly maturities observed on 372 Wednesday mornings over January 14, 1984, to July 19, 1991. The 372 Wednesday morning realizations of the implicit spot variances were also estimated. All parameters in annualized units except the risk-neutral half-life $(12\mid\mathtt{n}2)/\beta^{*}$ of volatility shocks, which is in months. Standard errors are in parentheses. $V_{jump}=\lambda^{*}\{[\ln(1+\bar{k}^{*})-\frac{1}{2}\delta^{2}]^{2}+\delta^{2}\}$ is the instantaneous conditional variance per year attributable to jumps in the risk-neutral distribution. $(\alpha/\beta^{*})$ is the steady-state level per year towards which stochastic variance $\mathbf{V}_{t}$ tends to revert.

<!-- Page:17 -->

Jumps and Stocbastic Volatility: Exchange Rate Processes Implicit in Deutscbe Mark Options and stochastic volatility-jump-diffusion (SVJD) specifications further improved the models' ability to fit option prices. The major impact was on in- and out-of-the-money 0- to 3-month call and put options, the fit for which improved by up to 0.015 percent. Slightly positive implicit skewess was estimated for all three models: positive correlation between exchange rate and volatility shocks and/or positivemean jumps. Similarly, parameter estimates from all models (substantial jump components and/or substantially volatile volatility) implied substantial implicit excess kurtosis. Based on the relative fits of the nonnested DVJD and SV models, the variation of higher implicit moments across different maturities is better characterized by the direct relationship implied by stochastic volatility models than by the strong inverse relationship characteristic of jump models.[^1]

The estimated instantaneous conditional (or “spot) variances $V_{j u m p}$ $+V_{t}$ were generally very close for all models, where $V_{j u m p}=\lambda^{*}\{\lbrack\mathrm{lin}(1\dot{+}$ $\bar{k}^{*})-{\textstyle\frac{1}{2}}\delta^{2}]^{2}+\delta^{2}\}$ is the (constant) variance per year atributable to jumps. However, the sample path for spot variance estimated under the SvJD model involved a reflection off the minimum value of $V_{j u m p}=(0.072)^{2}$ (see Figure 1), whereas the path estimated under the SV model never approached the reflecting barrier at $V_{t}=0$ More comparable to standard Black-Scholes implicit variances is the expected average variance

$$
E\overline{V} = V_{jump} + w(T)V_t + [1 - w(T)]\frac{\alpha}{\beta^*} \tag{27}
$$

for $w(T)=(1-e^{-\beta^{*}T})/\beta^{*}T\in\left(0,1\right)$ The expected average variance is a maturity-dependent weighted average of the spot variance $V_{j u m p}+V_{t}$ and the steady-state variance $V_{j u m p}+\alpha/\beta^{*}$ . Given estimated slow mean reversion, the estimated expected average variance for 0- to 6-month options was close to the spot variance and is consequently not shown.

Despite the improved fit relative to Black-Scholes, the conditional standard errors of the stochastic volatility/jump-diffusion model shown in Table 3 are still large. Freely parameterized option pricing models involving daily parameter reestimation typically yield substantially lower overall root mean squared error, on the order of 0.04 percent of the underlying asset price; examples include the constrained cubic spline and Merton (1976) jump-diffusion models in Bates (1991, 1994). While ad boc, such models do satisfy option-specific, no-arbitrage constraints and therefore generate theoretically valid option prices

---

[^1]: Bates (1994) finds that implicit excess kurtosis in DM and yen futures options tended to increase as option maturities decreased, but not as fast as predicted by Merton's (1976) jump-diffusion model.

<!-- Page:18 -->

<center><i>Figure 1 Instantaneous conditional (spot) volatility implicit in deutsche mark options, 1984-1991. Spot volatility is defined as <img src="https://latex.codecogs.com/svg.image?(\dot{V_{jump}}%2BV_{t})^{\frac{1}{2}}" style="vertical-align: middle; height: 1.2em;" alt="(\dot{V_{jump}}+V_{t})^{\frac{1}{2}}" class="latex-formula"/>, where <img src="https://latex.codecogs.com/svg.image?V_{jump}" style="vertical-align: middle; height: 1.2em;" alt="V_{jump}" class="latex-formula"/> is the variance attributable to the time-invariant jump component. The steady-state variance is <img src="https://latex.codecogs.com/svg.image?V_{jump}%2B\alpha/\beta^{*}" style="vertical-align: middle; height: 1.2em;" alt="V_{jump}+\alpha/\beta^{*}" class="latex-formula"/>. Expected average variances (roughly the Black-Scholes implied variances) are a maturity-dependent weighted average of spot and steady-state variances.</i></center>

<div align="center">
  <img src="images/f40f0456a5fd42f765591a7cca243210e8c90aa4158d319c864c312a491bb2ae.jpg" style="max-width: 70%;" />
</div>

consistent with some underlying distribution. The implications are that specification error is large relative to other sources of error, and that the postulated model fails to capture major changes in implicit distributions over time.

Further evidence of parametric instability is revealed in implicit parameter estimates over two-year subsamples; see Table 4. The major problem is that the postulated one-factor model for expected average variances in Equation (27) fails to capture the evolution over time of the term structure of implicit volatilities across short-term (0 to 3 month) and medium-term (3 to 6 month) maturities. Whereas the term structure was essentially flat in 1984 to 1985, as indicated by a long half-life to volatility shocks, steeper term structures were observed in subsequent years. Evolutions in other moments were also observed; implicit distributions were substantially positively skewed over the period 1984 to 1987, but were essentially symmetric over the period 1988 to 1991. Substantial implicit excess kurtosis was present in all biannual subsamples.

Parameter instability explains the apparent puzzle in Table 3 that average pricing errors for short-term in-the-money calls and out-of-the-money puts diverge in sign, whereas put-call parity (for the European portion of the option prices) implies that the pricing errors should be comparable in sign and magnitude. The divergent average

---

88

<!-- Page:19 -->

<center><i>Table 3 Residuals from estimation of the stochastic volatility/jump-diffusion model, categorized by cal/ put, moneyness, and maturity </i></center>

| Moneyness $(X/F - 1)$ | Number of observations | Average errors | Conditional standard deviations | Contemp. | Lagged | Number of observations | Average errors | Conditional standard deviations | Contemp. | Lagged | Call/put |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Short-term (0–3 month) calls |  |  |  |  |  | Short-term (0–3 month) puts |  |  |  |  |  |
| $< -6\%$ | 646 | .027% | .048% | .57 | .58 | 92 | $-.002\%$ | .135% | .80 | .07 | .07 |
| $[-6\%, -4\%]$ | 1140 | .016% | .055% | .62 | .28 | 132 | $-.001\%$ | .091% | .65 | .06 | .17 |
| $[-4\%, -2\%]$ | 1051 | .011% | .070% | .64 | .20 | 151 | .023% | .110% | .63 | $-.43$ | .37 |
| $[-2\%, -1\%]$ | 1151 | .011% | .076% | .70 | .10 | 283 | .003% | .090% | .61 | .09 | .37 |
| $[-1\%, 0\%]$ | 1360 | .011% | .085% | .71 | .17 | 585 | .002% | .097% | .78 | .12 | .36 |
| $[0\%, 1\%]$ | 1053 | .006% | .100% | .62 | $-.03$ | 920 | .034% | .093% | .75 | .07 | .46 |
| $[1\%, 2\%]$ | 499 | $-.030\%$ | .104% | .49 | .18 | 911 | .027% | .080% | .82 | .05 | .32 |
| $[2\%, 4\%]$ | 334 | $-.003\%$ | .114% | .46 | .18 | 788 | .022% | .072% | .88 | .09 | .30 |
| $[4\%, 6\%]$ | 576 | $-.039\%$ | .116% | .42 | .43 | 939 | .024% | .064% | .74 | .12 | .15 |
| $> 6\%$ | 534 | $-.070\%$ | .115% | .42 | .42 | 828 | .033% | .047% | .67 | .20 | .01 |
| Medium-term (3–6 month) calls |  |  |  |  |  | Medium-term (3–6 month) puts |  |  |  |  |  |
| $< -6\%$ | 492 | $-.027\%$ | .076% | .68 | $-.25$ | 38 | $-.095\%$ | .124% | .81 | .82 | .22 |
| $[-6\%, -4\%]$ | 434 | $-.009\%$ | .088% | .75 | .00 | 29 | $-.053\%$ | .100% | .92 | $-.38$ | .46 |
| $[-4\%, -2\%]$ | 333 | $-.009\%$ | .083% | .57 | .07 | 41 | $-.097\%$ | .115% | .85 | $-.04$ | .18 |
| $[-2\%, -1\%]$ | 434 | .013% | .086% | .74 | .30 | 76 | $-.019\%$ | .132% | .85 | $-.16$ | .22 |
| $[-1\%, 0\%]$ | 476 | $-.001\%$ | .094% | .70 | $-.05$ | 175 | $-.021\%$ | .120% | .85 | $-.22$ | .07 |
| $[0\%, 1\%]$ | 414 | $-.009\%$ | .094% | .59 | .04 | 208 | $-.009\%$ | .096% | .78 | .29 | .26 |
| $[1\%, 2\%]$ | 322 | $-.015\%$ | .116% | .59 | .07 | 271 | .001% | .095% | .64 | $-.04$ | .15 |
| $[2\%, 4\%]$ | 190 | $-.046\%$ | .125% | .73 | $-.27$ | 197 | .000% | .087% | .83 | .03 | .14 |
| $[4\%, 6\%]$ | 237 | $-.062\%$ | .125% | .56 | .06 | 410 | $-.011\%$ | .066% | .58 | $-.11$ | .22 |
| $> 6\%$ | 276 | $-.125\%$ | .160% | .60 | .36 | 663 | $-.003\%$ | .050% | .69 | .16 | .09 |

Average errors (actual less estimated option prices) and standard deviations are expressed as a percentage of the underlying spot exchange rate. Values of $0.2\%$ correspond roughly to 1 to $1{\frac{1}{2}}$ price ticks, or $\hat{0.10-0.15\Phi/\mathrm{DM}}$. The group-specific conditional standard deviation for group $I$ is $\big(\sum_{I,I}^{\mathbf{\Gamma}^{*}}+\dot{\sigma}_{I}^{2}\big)^{1/2}$, while the contemporaneous conditional correlation for residuals in group $I$ is $\pmb{\Sigma}_{I,I}/(\pmb{\Sigma}_{I,I}+\pmb{\sigma}_{I}^{2})$. Contemporaneous correlations across groups are not shown for reasons of space, excepting the call/put correlations. For a given maturity and contract (call or put), correlations between residuals of different moneyness groups increased with proximity. Residuals from different maturities were typically negatively correlated.

<!-- Page:20 -->

<center><i> </i></center>

| Model      | $\lambda^{*}$ | $\bar{k}$ | $\delta$ | $\sqrt{V_{\text{jump}}}$ | $\alpha$ | $\beta^{*}$ | $\sigma_{v}$ | $\rho$ | $\sqrt{\frac{\sigma}{\beta^{*}}}$ | half-life (months) | In Loptions |
|------------|---------------|-----------|----------|--------------------------|----------|-------------|--------------|--------|----------------------------------|--------------------|-------------|
| SV:        |               |           |          |                          |          |             |              |        |                                  |                    |             |
| 1984-1991  | .051          | 1.50      | .284     | .045                     | .284     | .155        | .078         | .078   | .155                             | 6.4                | 120,644.45  |
| 1984-1985  | .026          | .68       | .280     | .071                     | .280     | .196        | .071         | .071   | .196                             | 12.3               | 36,021.05   |
| 1986-1987  | .050          | 2.53      | .319     | .054                     | .319     | .140        | .054         | .054   | .140                             | 3.3                | 39,813.06   |
| 1988-1989  | .074          | 4.87      | .385     | -0.001                   | .385     | .123        | .001         | .001   | .123                             | 1.7                | 25,524.28   |
| 1990-1991  | .097          | 6.57      | .424     | -0.012                   | .424     | .124        | .012         | .012   | .124                             | 1.3                | 19,420.31   |
| SVID:       |               |           |          |                          |          |             |              |        |                                  |                    |             |
| 1985-1991  | 15.01         | .019      | .072     | .019                     | .072     | .144        | .019         | .072   | .144                             | 10.6               | 120,699.27  |
| 1984-1985  | 19.26         | .015      | .068     | .015                     | .068     | .219        | .015         | .068   | .219                             | 24.3               | 36,027.25   |
| 1986-1987  | 8.17          | .023      | .067     | .023                     | .067     | .120        | .023         | .067   | .120                             | 3.9                | 39,827.03   |
| 1988-1989  | 11.28         | -0.001    | .053     | .016                     | .053     | .112        | .016         | .053   | .112                             | 2.2                | 25,537.86   |
| 1990-1991  | 5.10          | -0.003    | .056     | .025                     | .056     | .109        | .025         | .056   | .109                             | 1.5                | 19,426.11   |
|            |               |           |          |                          |          |             |              |        |                                  |                    | 120,818.25  |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i></i>
</div>
</center>

---

90

<!-- Page:21 -->

moneyness biases for calls versus puts reflects the fact that calls were relatively heavily traded in the first half of the 1984 to 1991 period, while puts were more heavily traded in the second half. Synchronous call and put residuals are typically comparable in sign and magnitude.

## 3. Tests of Consistency with the Underlying Time Series

### 3.1 Tests of consistency with the time series properties of implicit volatilities

As noted by Cox, Ingersoll, and Ross (1985), the transition density of $y=2c V_{t+\Delta t}$ conditional on $V_{t}$ is noncentral $\chi^{2}(4\alpha/\sigma_{v}^{2},~2c V_{t}e^{-\dot{\beta}\Delta t})$ where $c^{-\mathrm{i}}\equiv{\textstyle{\frac{1}{2}}}\sigma_{v}^{2}(1-e^{-\beta\Delta t})/\beta$ and $\beta$ is the actual rate of mean reversion of the volatility process (as distinct from the risk-adjusted parameter $\beta^{*}$ implicit in option prices):

$$
p(y \mid V_t) = \frac{e^{-\frac{1}{2}(y + \Lambda)} y^{\frac{1}{2}v - 1}}{2^{\frac{1}{2}v}} \sum_{j=0}^{\infty} \frac{\left(\frac{1}{4}y\Lambda\right)^j}{\Gamma\left(\frac{1}{2}v + j\right) j!} \tag{28}
$$

where $\nu\equiv4\alpha/\sigma_{\nu}^{2}$ , $\Lambda\equiv2c V_{t}e^{-\beta\Delta t}$ , and $\Gamma(\cdot)$ is the gamma function. However, the noncentral $\chi^{2}$ density function has infinite value at $2c V_{t+\Delta t}=0$ when the reflecting barrier is attainable $\begin{array}{r}{(\frac{1}{2}\nu<1)}\end{array}$ , yielding nonsensical results when the sample path $\{V_{t}\}$ is among the parameters to be estimated. Consequently, the applications below use the transition density of the monotonic transformation $\ln(V_{t+\Delta t})$ , which has finite density everywhere:

$$
p(\ln V_{t+\Delta t} \mid V_t) = \frac{e^{-\frac{1}{2}(e^z + \Lambda)} (e^z)^{\frac{1}{2}v}}{2^{\frac{1}{2}v}} \sum_{j=0}^{\infty} \frac{(\frac{1}{4}e^z \Lambda)^j}{\Gamma(\frac{1}{2}v + j) j!} \tag{29}
$$

where $e^{z}=2c V_{t+\Delta t}$ .

Maximum likelihood estimates of the parameters $\{\alpha,\beta,\sigma_{\nu}\}$ using the time series of implicit instantaneous conditional volatilities $\{V_{t}\}$ diverge substantially from the parameters $\{\alpha,\beta^{*},\sigma_{\upsilon}\}$ estimated crosssectionally from option prices, as is shown in Table 5 (sV and sVJD models). In particular, the volatility of variance parameter $\sigma_{\upsilon}$ implicit in option prices is substantially higher than the supposedly identical parameter estimated off the time series properties of $\{V_{t}\}$ . The parameters $\pmb{\alpha}$ and $\beta$ affecting the drift are estimated with less precision; nevertheless, there is a significant deviation.

Given noisy option prices, however, the above two-step estimation procedure does not constitute a formal test of the hypothesis of identical $\{\alpha,\sigma_{v}\}$ parameters for option prices and time series. Under the assumptions that option residuals are appropriately modeled by Equation (23) and are independent of volatility realizations, the appropriate

<!-- Page:22 -->

<center><i>Table5 Unconstrained and constrained maximum Hikelihood estimates of stochastic volatility/jump-diffusion parameters </i></center>

|                       | Jump parameters |     |     |               | Stochastic volatility parameters |       |       |       |       |     | Half-life | $\ln L_{options}$ |
|-----------------------|----------------|-----|-----|---------------|--------------------------------|-------|-------|-------|-------|-----|-----------|-------------------|
|                       | $\lambda^{*}$  | $\bar{k}^{*}$ | $\delta$ | $\sqrt{V_{jump}}$ | $\alpha$ | $\beta^{*}$, $\beta$ | $\sigma_{v}$ | $\rho$ | $\sqrt{\alpha/\beta^{*}}$, $\sqrt{\alpha/\beta}$ | (months) | ln $L_{\{V\}}$ |
| Unconstrained implicit parameter estimation (SV) |               |     |     |               |                                |       |       |       |       |     |           |                   |
| Options               | .031           | 1.30 | .285 | .045          | .155                           | .001  | .01   | .005  | .002  | .002 | 6.4       | 120,644.45        |
| Resulting $\{V_t\}$   | .058           | 3.55 | .140 |               | .128                           | .015  | 1.01  | .005  | .007  | .7   | 2.3       | 162.91            |
| Constrained estimation (SVC) |               |     |     |               |                                |       |       |       |       |     |           |                   |
| Options               |                |      |      |                | .50                            | .013  | .09   | .052  | .006  | .006 | 16.7      | 120,557.97        |
| $\{V_t^c\}$           |                |      |      |                | .72                            | .002  | .53   |       | .048  | 8.6  | 11.5      | 174.84            |
| $\{V_t^c\}$           |                |      |      |                | .053                           | .105  | .96   | .114  | .007  | .8   | 2.6       | 243.16            |
| Unconstrained implicit parameter estimation (SVJD) |              |     |     |               |                                |       |       |       |       |     |           |                   |
| Options               | 15.01          | -0.001 | 0.19 | .072          | .19                            | 1.21  | .000  | .001  | .001  | .001 | 10.6      | 120,699.27        |
| Resulting $\{V_t\}$   | .001           | .04  | .168 |               | .197                           | .001  | .81   | .006  | 2.146 | 4945.1 | 225.8     | -14.71            |

<!-- Page:23 -->

<center><i>Table 5 continued </i></center>

|               | Jump parameters |            |             |                       | Stochastic volatility parameters |             |                  |             |             |       | Half-life |                     | $\ln L_{\{V\}}$ |
|---------------|----------------|------------|-------------|-----------------------|--------------------------------|-------------|------------------|-------------|-------------|-------|-----------|---------------------|-----------------|
|               | $\lambda^{*}$  | $\bar{k}^{*}$ | $\delta$   | $\sqrt{V_{\text{jump}}}$ | $\alpha$                      | $\beta^{*}$, $\beta$ | $\sigma_{v}$ | $\rho$      | $\sqrt{\alpha/\beta^{*}}$, $\sqrt{\alpha/\beta}$ |       | (months)  | $\ln L_{\text{options}}$ |                  |
| Constrained estimation (SVJDC) |              |            |             |                       |                               |                     |               |             |                                         |       |           |                     |                  |
| Options       | .55            | -0.004     | .076        | .057                  | .30                            | .30                  | .126            | .078        | .078                                     |       | 27.5      | 120,589.89          |                  |
|               | (.03)          | (.000)     | (.002)      |                       | .002                           | (.18)                | (.022)          | (.039)      | (.16.4)                                   |       |           |                     |                  |
| $\{V_{t}^{c}\}$ |              |            |             |                       |                               | .17                  |                | 1.03        |                                         |       | 48.4      | 214.94              | 120,804.83       |
|               |                |            |             |                       | (.003)                         | (.32)                |                | (.098)      | (.91.4)                                   |       |           |                     |                  |
| $\{V_{t}^{c}\}$ |              |            |             |                       | .044                           | 2.98                 | .112            | .121        | 2.8                                      |       |           | 224.69              |                  |
|               |                |            |             |                       | (.012)                         | (92)                 | (.004)          | (.007)      | (9.9)                                     |       |           |                     |                  |

For definition of parameters, see Table 2. Standard errors are in parentheses. $\beta^{*}$ and $\beta$ are the risk-neutral and actual rates of volatility mean reversion, estimated from options and time series data, respectively. $\mathrm{SV/SVJD}$ are the unconstrained estimates of the parameters (and spot variances) implicit in option prices, using the log likelihood function $\ln\bar{L}_{\mathrm{options}}$ . The maximum likelihood parameter estimates (using $\ln_{H_{V}}$ Of the stochastic volatility process followed by the resulting time series of implicit spot variances $\{V_{t}\}$ are also reported. SvC/sVJDC are the constrained estimates of the parameters and (implicit spot variances) under the constraint $\{\alpha,\sigma_{\nu}\}_{\mathrm{options}}=\{\alpha,$ $\sigma_{\nu}\}$ time series, using the log likelihood function $L_{\mathrm{options}}+\ln{L_{\{V\}}}$ Imposition of parameter constraints across options and time series also affects (smooths) the estimated time series of implicit spot variances $\{V_{i}^{\bar{\epsilon}}\}$ . The maximum likelihood parameter estimates (using In $L_{\{V\}})$ of the stochastic volatility process followed by the resulting time series of smoothed implicit spot variances $\{V_{t}^{c}\}$ are also reported for unconstrained $\pmb{\alpha}$ and $\sigma_{v}$

<!-- Page:24 -->

loss function for testing hypotheses is 

$$
\ln L(\{V_t\}, \theta, \beta) = \ln L_{\text{options}} + \ln L_{V} \tag{30}
$$

where $\ln{\cal L}_{\text{options}}(\{V_{t}\},\theta)$ is the function of option pricing residuals given in Equation (26), and $\ln L_{\{V\}}=\Sigma_{t}\ln{{p(\ln(2c V_{t})\mid\alpha,\beta,\sigma_{\nu};~V_{t-1})}}$ is the log-likelihood of an estimated $\{V_{t}\}$ sample path given $p(\cdot)$ from Equation (29). 

The likelihood function was again estimated by sequential maximization over process and covariance parameters, iterated to convergence. The joint hypothesis of identical $\{\alpha,\sigma_{\nu}\}$ parameters for options and time series was tested using a likelihood ratio test: 

Unconstrained parameter estimates: ($\{V\}$, $\lambda^*$, $k^*$, $\delta$, $\alpha$, $\beta^*$, $\sigma_{\nu}$, $\pi_{\text{options}}$, $\phi_{\alpha}$, $\beta$, $\sigma_{\nu}$ for time series)
Constrained parameter estimates: ($\{V\}$, $\lambda^*$, $k^*$, $\delta$, $\alpha$, $\beta$, $\beta^*$, $\sigma_{\nu}$ for options & time series)

The effects of imposing the constraint that spot variance estimates be plausible are shown in Table 5, models SVC and SVJDC, and in Figure 2. Constraining the volatility process brought the volatility of variance parameter $\sigma_{v}$ more in line with the time series behavior of $\{V_{t}^{\mathrm{c}}\}$ and smoothed the estimated sample paths of $\{V_{t}^{\mathrm{c}}\}$ . In fact, constrained estimation actually increased the joint log-likelihood of the stochastic volatility/jump-diffusion model. The unconstrained $\{V_{t}\}$ sample path estimated from options (svJD model) without regard for time series plausibility was in fact highly unlikely for low (and low-volatility) values of $V_{t}$ , for which transition densities were nearly degenerate. 

Nevertheless, both the stochastic volatility and the stochastic volatility/jump-diffusion models indicate substantial inconsistency between option prices and the underlying implicit volatility process. The constraint of identical $\{\alpha,\sigma_{\nu}\}$ parameters in the options and resulting $\{V_{t}\}$ time series data for the sV model is strongly rejected, based on two criteria: (1) the worsening of the joint log-likelihood (120,733 versus 120,807— $\cdot p$ -value $<10^{-16}$); and (2) the inconsistency of the constrained $\{V_{t}^{\mathrm{c}}\}$ implicit parameters $\{\alpha,\sigma_{\nu}\}$ and the constrained sample path {V§} (log-likelihood 243 versus 175—p-value <β10-16). The latter criterion also yields rejection of the SVJDC model (log-likelihood of 225 versus 215— $\cdot p$ -value $=6\times10^{-5}$). A comparison of the SvC and SVJDC models indicates that the implicit jump component continues to be strongly significant ($\mathcal{p}$ -value $<10^{-16}$)

The rejections indicate that the stochastic volatility model is consistent with the “volatility smile" evidence of implicit leptokurtosis only for extreme and implausible levels of the volatility of variance. The implausibility of the high $\sigma_{\nu}$ estimated under the sV model is

<!-- Page:25 -->

<center><i>Figure 2: Unconstrained and constrained spot volatilities implicit in deutsche mark options, 1984-1991. Spot volatilities were estimated using the stochastic volatility/jump-diffusion model. Constrained estimates involved likelihood-based endogenous smoothing that reflected estimated volatility process parameters.</i></center>

<div align="center">
  <img src="images/f848a0e11bc4ad061101bbdc282beac31fa6088172ae96ee480bdc3b2da80c82.jpg" style="max-width: 70%;" />
</div>

particularly evident when one compares the unconditional gamma distribution of { V} implicit in option prices with the sample distribution of $\{V_{t}\}$ (Figure 3). A high volatility of variance implies frequent reflections off zero and substantial clustering of implicit instantaneous variances near 0, contrary to what is observed. The SVJDC model by contrast is more compatible with a plausible stochastic variance process, and attributes the implicit leptokurtosis to a jump component of substantial amplitude and biannual frequency similar to that estimated for the deterministic volatility/jump-diffusion model in Table 2.

Previous studies have argued that the term structure of implicit volatilities is inconsistent with the time series properties of implicit volatilities.$^{24}$ Particular attention has been drawn to the discrepancy between the long half-life to volatility shocks implicit in the term structure of implicit volatilities relative to observed faster mean reversion in implicit volatilities. In this model, the term structure of implicit expected average variances for 0- to 3-month versus 3- to 6-month options depends on the parameters α and β*; see Equation (27). Since the expected average variance is roughly the implicit variance from

---

4 Stein (1989) makes this argument with regard to implicit volatilities from S&P 100 options, while Campa and Chang (1995) examine interbank foreign currency options.

<!-- Page:26 -->

<center><i>Figure3 Theoretical and sample histograms for spot variances, 1984-1991, stochastic volatility (sv)model</i></center>

<div align="center">
  <img src="images/b1e2c77fd32db8779e9e467c54373031b10f2c3e4ee0e387757458949ec93921.jpg" style="max-width: 70%;" />
</div>

the Black-Scholes model,$^{25}$ the question is whether the $(\alpha, \beta^{*})$ parameters implicit in option prices are consistent with the $\langle\alpha,\beta\rangle$ parameters estimated from the AR(1) time series model for implicit variances.

The two sets of parameters do in fact diverge in unconstrained parameter estimation. However, the parameters can in principle diverge because of a volatility risk premium. Furthermore, the subsample estimates reported in Table 4 suggest that the full-sample estimates of $\langle\alpha,\beta^{*}\rangle$ were heavily influenced by the unusual term structure of implicit spot variances during the 1984 to 1985 period. Subsequent subsample estimates from 1986 to 1991 appear more compatible with the time series behavior of spot implicit variances in terms of the steadystate level and the rate of reversion toward that level.

### 3.2 Tests of consistency with the time series properties of futures prices

A further test of the stochastic volatility and stochastic volatility/jumpdiffusion models is their consistency or inconsistency with observed realizations of exchange rates and foreign currency futures prices. To examine this, the actual (as opposed to risk-neutral) futures price

---

25 In principle, there are Jensen's inequality biases relevant to the choice of implicit volatilies versus implicit variances and to the choice of the moneyness of the options used in computing implicit volatilities. These biases do not appear empirically important for plausible o, and jump parameters.

<!-- Page:27 -->

process was parameterized as follows: 

<!-- Page:28 -->

instantaneous variance was modeled as a linear transform of the instantaneous variance realization implicit in option prices: 

$$
V_{t}=c u_{0}+c\nu_{1}V_{t}^{\text{options}},\quad c u_{0}\ge0\qquad(37)
$$

where the coefficients $c u_{\mathrm{0}}$ and $c{\nu_{1}}$ were estimated. The actual (as opposed to risk-neutral jump parameters were also estimated, as were the influences of interest differentials and instantaneous volatility. Since option prices provide no direct information about the true rate of variance mean reversion, β was initially treated as a free parameter to be estimated from futures data. Parameters were estimated, first treating jump volatility $\delta$ as a free parameter, and subsequently constraining it to the value implicit in option prices. The former is more comparable methodologically with time series studies such as Akgiray and Booth (1988) and Jorion (1988), who have found highfrequency, low-amplitude exchange rate jump components of little significance for 1- to 6-month option prices. Estimation of the latter constrains jump amplitudes to values relevant at typical option maturities, permits explicit testing of that constraint, and is of course theoretically correct. 

The futures data were short-maturity (typically 0 to 3 month) noon quotes on Wednesdays for which there were options data available. The typical time interval was 1 week, although there were five occasions in which missing options data resulted in a longer time interval. To avoid maturity shifts, the futures contract maturity was the shortest maturity such that futures contracts with identical delivery dates existed at the next available Wednesday.26 One-month Eurocurrency interest rates were used for the interest differential. 

Maximum-likelihood estimates of the parameters are presented in Table 6A. As has been found elsewhere, estimates of the conditional mean suggest that it is the spot exchange rate rather than the futures price that follows a martingale, although neither hypothesis can be rejected in this single-currency regression.27 No statistically significant jump component was found. The hypothesis that implicit volatilities provide no useful information in forecasting future volatilities was strongly rejected for $\{V_{t}^{\text{options}}\}$ sample paths estimated from both the 

---

26 For example, June 1984 options on March 5, 1984, were used to predict the March 1984 futures price transition from March 5 to March 12. On March 12, June 1984 options were used to predict the June 1984 futures price transition from March 12 to March 19.

27 See Hodrick (1987)and Froot and Thaler (1990) for surveys of the extensive literature on rejections of uncovered interest parity, which is equivalent to rejection of the hypothesis that the futures price follows a martingale. The strongest rejections of uncovered interest parity have been within a multicurrency framework [e.g., Hsieh (1984).

<!-- Page:29 -->

Iumps and Stocbastic Volatility: Excbange Rate Processes Implicit inDeutscbe Mark Options 

<!-- Page:30 -->

<center><i>Table6 Maximum likelihood estimates of the \$/DM futures price process conditional on parameters and instantaneous conditional variances implicit in options prices </i></center>

| Model | $\lambda$ | $\bar{k}$ | $\delta$ | $\sqrt{V_{jump}}$ | $\beta$ | $c_0$ | $c_1$ | $c_v$ | $cv_0$ | $cv_1$ | $\ln L_{\{F\}}$ | $cv_0 = 0,$ $cv_1 = 0$ | $cv_1 = 1$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A. Estimates using unconstrained implicit $\{V_{t}^{options}\}$, $\alpha$, $\sigma_v$, $\rho$ from Table 5, SV and SVJD models. $\beta$ estimated as a free parameter | | | | | | | | | | | | | |
| SV | | | | | 1.18 | -0.154 | -2.10 | 16.1 | 0.0052 | 0.607 | 987.26 | 0.068 | 0.000 |
| | | | | | (9.07) | (0.149) | (1.54) | (8.9) | (0.0023) | (0.165) | | | |
| SVJD | 0.25 | 0.055 | 0.002 | 0.027 | 7.92 | -0.150 | -1.96 | 16.4 | 0.0086 | 0.606 | 987.78 | 0.670 | 0.001 |
| | (0.36) | (0.024) | (0.020) | (0.017) | (19.27) | (0.194) | (2.10) | (13.4) | (0.0017) | (0.246) | | | |
| SVJD | 0.35 | 0.043 | 0.019<sup>1</sup> | 0.027 | 7.37 | -0.157 | -1.95 | 17.0 | 0.0086 | 0.596 | 987.67 | 0.000 | 0.001 |
| | (0.78) | (0.051) | (0.019) | (0.019) | (19.86) | (0.198) | (2.11) | (13.7) | (0.0025) | (0.248) | | | |
| B. Estimates using constrained implicit $\{V_{t}^{options}\}$, $\alpha$, $\beta$, $\sigma_v$, $\rho$ from Table 5, SVC and SVJDC models | | | | | | | | | | | | | |
| SV | | | | | 0.72<sup>1</sup> | -0.201 | -1.90 | 19.0 | 0.0040 | 0.683 | 987.06 | 0.323 | 0.000 |
| | | | | | (0.191) | (2.12) | (12.7) | (0.0029) | (0.206) | | | | |
| SVJDC | 0.38 | 0.052 | 0.001 | 0.031 | 0.17<sup>1</sup> | -0.188 | -1.85 | 19.2 | 0.0051 | 0.628 | 988.18 | 0.135 | 0.001 |
| | (0.40) | (0.019) | (0.018) | (0.014) | (0.196) | (2.06) | (14.0) | (0.0028) | (0.220) | | | |
| SVJDC | 0.12 | 0.040 | 0.076<sup>1</sup> | 0.029 | 0.17<sup>1</sup> | -0.197 | -1.89 | 19.1 | 0.0053 | 0.663 | 986.98 | 0.072 | 0.001 |
| | (0.48) | (0.103) | (0.058) | (0.201) | (0.213) | (13.6) | (0.0030) | (0.275) | | | | |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>eaqtWedfins uturesmaturitywasthe shortest maturity that did not involve amarity shifFutures rice evolutionbetween observationswas assumed of the fo </i>
</div>
</center>

$$
dF/F = \left[c_0 + c_1(r_t - r_t^*) + c_vV_t - \lambda \bar{k}\right]dt + \sqrt{V_t}dZ + k \ dq
$$

$$
\text{prob}(dq) = \lambda dt; \ln(1 + k) \sim N\left[\ln(1 + \bar{k}) - \frac{1}{2} \delta^2, \delta^2\right]
$$

$V_{t}=c v_{0}+c v_{1}V_{t}^{o p t i o n s}$ $c u$ $c v_{1}\geq0$ Imposing the nojumps $(\lambda=0)$ constraint on the SVD and SVDC models yielded log likelihoods of987.33and986.95,respectively,withassociatedpvalues of343and117.Imposing the options constraint on the SVJD and svjDC models had associated $p$ values of $639$ and .121, respectively. Parameterconstrainedto thecorrespondingvalue fromTable $5$

<!-- Page:31 -->

<center><i>Table7 Summary statistics for log-differenced weekly exchange rates </i></center>

| Period | January 1974–December 1985 | January 1984–June 1991 |
|---|:---:|---:|
| Series | $\$/\text{DM exchange rate (Jorion 1988)}$ | $\$/\text{DM futures price}$ |
| Number of observations | 626 | 385 |
| Mean (percent per annum) | 0.7 | 5.8 |
| Standard deviation (percent, annualized) | 10.2 | 12.3 |
| Skewness | .251 | .321 |
| Excess kurtosis | 3.29 | 1.00 |
| $H_0$: no jumps | Rejected at 1% level | Not rejected |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>\<img src="https://latex.codecogs.com/svg.image?/DM%20futures%20prices%20were%20Wednesday%20noon%20transaction%20prices%20for%20the%20shortest%200%20to%203-month%20maturity%20available%20that%20did%20not%20involve%20a%20maturity%20shift.Skewness%20and%20excess%20kurtosis%20for%20logdifferenced%20\" style="vertical-align: middle; height: 1.2em;" alt="/DM futures prices were Wednesday noon transaction prices for the shortest 0 to 3-month maturity available that did not involve a maturity shift.Skewness and excess kurtosis for logdifferenced \" class="latex-formula"/>/DMfutures prices excluding the 8% DM appreciation observed during the week of the Plaza Agreement (September 18-25, 1985) were .098 and .08, respectively. </i>
</div>
</center>

The absence of a statistically significant jump component in the $\$/DM$ futures price over the period 1984 to 1991 is inconsistent with previous time series studies of the $\$/DM$ exchange rate. Akgiray and Booth (1988) and Jorion (1988) both found statistically significant jump components, while Bollerslev, Chou, and Kroner (1992) cite other studies that have found fat-tailed residuals in the $\$/DM$ exchange rate even after adjusting for ARCH/GARCH effects. However, Table 7 indicates that the distribution of the $\$/DM$ exchange rate has changed, with less excess kurtosis for weekly returns over the 1984 to 1991 period than was the case from 1974 to 1985. Furthermore, the estimated unconditional skewness and excess kurtosis were entirely attributable to the single Plaza Agreement outlier.

## 4. Summary and Conclusions

This article has generated model-specific estimates of the distributions implicit in deutsche mark options, and has tested the compatibility of those distributions with the distributions estimated from time series of implicit volatilities and $\$/DM$ futures prices. There was substantial qualitative agreement between implicit and time series-based distributions, most notably with regard to implicit volatilities as forecasts of future volatility. The volatility smile evidence of implicit excess kurtosis could be explained by the stochastic volatility model only under

<!-- Page:32 -->

parameters that were implausible given the time series properties of implicit volatilities. By contrast, the attribution of the implicit excess kurtosis to fears of infrequent substantial jumps yielded plausible implicit jump parameters that were substantially consistent with the 8 percent jump in the $\$/\mathrm{DM}$ exchange rate observed during the week of the Plaza Agreement. Given a fundamental lack of power when testing for infrequent substantial jumps using time series data, however, the hypothesis of no jumps was as plausible as the hypothesis that jump magnitudes matched those implicit in option prices.

Specific deficiencies of the postulated stochastic volatility/jumpdiffusion model were also noted, suggesting potential areas of improvement for the next generation of models. The major issue is parameter instability—most notably with regard to the term structure of implicit volatilities. The postulated one-factor model for expected average variances does a poor job in capturing the evolution over time of implicit volatilities from multiple option maturities. There is therefore substantial scope for improvement from using multifactor rather than single-factor models of stochastic volatility. Evolution in implicit skewness is also apparent, from substantially positive over the period 1984 to 1987 to essentially zero over the period 1988 to 1991. By contrast, the implicit excess kurtosis underlying the volatility smile has been a persistent feature in all subsamples. Identification of alternate fat-tailed distributions that better match the profle of excess kurtosis across different option maturities is also desirable.

The extensions proposed above are premised on the presumed existence of a stable data-generating process underlying observed exchange rates and option prices. This assumption of stability is driven by econometric necessity rather than a priori reasoning; there is no reason to believe market participants do in fact maintain the same conditional distributions regarding future exchange rate realizations. The evidence of parameter instability suggests that option pricing models based solely on more and more complicated descriptions of the underlying asset price process may ultimately face the same limitations as their corresponding discrete-time ARCH/GARCH counterparts. The ultimate research agenda may therefore be to identify those omitted "fundamentals" that are showing up as parameter shifts in current option pricing models.

## Appendix

### Analytical solutions for moment generating functions

As noted above, the price of a European call can be written as

$$
c = e^{-rT} (FP_1 - XP_2) \tag{A1}
$$

---

102

<!-- Page:33 -->

where F = E*(Sr) = SebT is the forward price on the asset; P2 = prob*(Sr > X) is one minus the risk-neutral distribution function; and $\begin{array}{r}{\overset{\cdot}{P}_{1}=\int_{X}^{\infty}[S_{T}/E^{*}(S_{T})]p^{*}(S_{T})~d S_{T}}\end{array}$ is also a probability.

The moment generating function $F_{2}(\Phi\mid s_{0},V_{0},T)$ associated with the log of the terminal asset price sr = In(Sr) under the risk-neutral probability measure,

$$
F_2(\Phi \mid s_0, V_0, T) \equiv E^* e^{\Phi_{s_T}} = e^{-rT} E^*[e^{rT} e^{\Phi_{s_T}}] \tag{A2}
$$

can be viewed as the current price of a contingent claim that pays off $e^{r T+\Phi s}$ at time $T$. The price of a related contingent claim $G(s_{0},V_{0},T;\Phi)$ that pays off e*s must satisfy the standard condition for contingent claims prices:

$$
E^{*}d G=r G d t.\qquad(\mathrm{A}3)
$$

Since G = e-rT F2, a simple transformation of variables indicates that F2 must solve the related condition E*dF2 = 0. For the stochastic volatility/jump-diffusion process considered above, this implies that $F_{2}$ solves

$$
-F_T + (b - \lambda^* k^* - \frac{1}{2} V) F_S + (\alpha - \beta^* V) F_V + \frac{1}{2} V (F_{ss} + 2 \rho \sigma_v F_{sV} + \sigma_v^2 F_{VV}) + \lambda^* E [F(s + \gamma^*, V) - F] = 0 \tag{A4}
$$

$$
\gamma^* \equiv \ln(1 + k^*) \sim N(\ln(1 + k^*) - \frac{1}{2} \delta^2, \delta^2).
$$

subject to the moment generating function boundary condition

$$
F_{2}|_{T=0} = e^{\Phi^{s}}. \tag{A5}
$$

A related problem is discussed in Ingersoll (1987, chap. 18) with regard to pricing bonds. Using a similar methodology, the solution is

$$
F_2(\Phi; s_0, V_0, T) = \exp\{\Phi s_0 + C_2(T; \Phi) + D_2(T; \Phi) V_0 + \lambda^* T [(1 + \bar{k}^*)^\Phi e^{\frac{1}{2} \delta^2 (\Phi^2 - \Phi)} - 1]\}. \tag{A6}
$$

$C_{2}$ and $D_{2}$ solve two ordinary differential equations,

$$
D_T = \frac{1}{2}\sigma_v^2 D^2 + (\rho \sigma_v \Phi - \beta^*) D + \frac{1}{2} (\Phi^2 - \Phi), \, D|_{T=0} = 0 \tag{A7}
$$

$$
C_T = (b - \lambda^* k^*) \Phi + \alpha D, \quad C|_{T=0} = 0 \tag{A8}
$$

<!-- Page:34 -->

and have the solutions

$$
\Gamma_{2}(T; \Phi) = (b - \lambda^{*} k^{*}) \Phi T - \frac{\alpha T}{\sigma_{v}^{2}} (\rho \sigma_{v} \Phi - \beta^{*} - \gamma_{2}) - \frac{2 \alpha}{\sigma_{v}^{2}} \ln \left[ 1 + \frac{1}{2} (\rho \sigma_{v} \Phi - \beta^{*} - \gamma_{2}) \frac{1 - e^{\gamma_{2} T}}{\gamma_{2}} \right] \tag{A9}
$$

$$
D_{2}(T; \Phi) = \frac{\Phi - \Phi^{2}}{\rho \sigma_{v} \Phi - \beta^{*} + \gamma 2 \frac{1 + e^{\gamma_{2} T}}{1 - e^{\gamma_{2} T}}} \tag{A10}
$$

where

$$
\gamma_2 = \sqrt{(\rho \sigma_v \Phi - \beta^*)^2 + \sigma_v^2 (\Phi - \Phi_2)} \tag{A11}
$$

Solving for $\begin{array}{r}{P_{1}=\int_{X}^{\infty}[S_{T}/E^{*}(S_{T})]p^{*}(S_{T})d S_{T}}\end{array}$ is slightly trickier because it is not the probability function of the risk-neutral probability measure. However,

$$
G = e^{-rT} F P_1 = S e^{(b-r)T} P_1 \tag{A12}
$$

is the price of a contingent claim that pays off $S_{T}$ at time $T$ conditional on $S_{T}>X$ and 0 otherwise. Consequently, $G$ solves the standard condition of Equation (A3). Since

$$
\frac{dG}{G} = -(b - r)dt + \frac{dS}{S} + \frac{dP}{P} + \left(\frac{dS}{S}\right)\left(\frac{dP}{P}\right) \tag{A13}
$$

and $E^{*}(d S/S)=b S d t,P_{1}$ must satisfy

$$
E^*\left[dP+\frac{dS}{S}dP\right]=0. \tag{A14}
$$

Writing $P_{1}=P_{1}(s,V,T)$ as a function of the log of the asset price and using Equation (A14) yields the integro-differential equation

$$
-P_{T} + \left( b - \lambda^{*}\bar{k}^{*} + \frac{1}{2}V \right)P_{s} + (\alpha - \beta^{*}V + \rho\sigma_{v}V)P_{V} + \frac{1}{2}V(P_{ss} + 2\rho\sigma_{v}P_{sV} + \sigma_{v}^{2}P_{VV}) + \lambda^{*}E\{e^{\gamma^{*}}[P(s + \gamma^{*}, V) - P]\} = 0 \tag{A15}
$$

$$
\gamma^* \equiv \ln (1 + k^*) \sim N \left( \ln (1 + \bar{k}^*) - \frac{1}{2} \delta^2, \delta^2 \right).
$$

The moment generating function $F_{1}(\Phi;s_{0},V_{0},T)$ underlying $P_{1}$ must of course also solve the same equation subject to the moment generating function boundary condition of Equation (A5). Using the property

---

104

<!-- Page:35 -->

of normal distributions 

$$
Ee^z f(z) = e^{\bar{z} + \frac{1}{2}\sigma_z^2} E f(z^*) \quad \text{for} \ z \sim N(\bar{z}, \sigma_z^2) \tag{A16}
$$

the equation can be written as 

$$
F_T = \left( b - \lambda^* \bar{k}^* + \frac{1}{2} V \right) F_s + [\alpha - (\beta^* - \rho \sigma_v) V] F_V \\ + \frac{1}{2} V (F_{ss} + 2 \rho \sigma_v F_{sV} + \sigma_v^2 F_{VV}) \\ + \lambda^* (1 + \bar{k}^*) E \{ [F(x + \gamma^{**}, V) - F] \} \tag{A17}
$$

$$
\gamma^{**} \sim N(\ln(1 + \bar{k}^*) + \frac{1}{2} \delta^2, \delta^2),
$$

which is of the same form as Equation (A4), with modified parameters. The resulting solution for the moment generating function is 

$$
F_1(\Phi; s_0, V_0, T) = \exp\{\Phi s_0 + C_1(T; \Phi) + D_1(T; \Phi)V_0 \\ + \lambda^*T(1+\bar{k}^*)[(1+\bar{k}^*)^\Phi e^{\frac{1}{2}\delta^2(\Phi^2+\Phi)} - 1]\} \tag{A18}
$$

where 

$$
\mathcal{C}_1(T; \Phi) = (b - \lambda^* \bar{k}^*) \Phi T - \frac{\alpha T}{\sigma_v^2} (\rho \sigma_v \Phi - \beta^* + \rho \sigma_v - \gamma_1) - \frac{2\alpha}{\sigma_v^2} \ln \left[1 + \frac{1}{2} (\rho \sigma_v \Phi - \beta^* + \rho \sigma_v - \gamma_1) \frac{1 - e^{\gamma_1 T}}{\gamma_1} \right] \tag{A19}
$$

$$
D_{1}(T; \Phi)=\frac{-\Phi-\Phi^{-}}{\rho \sigma_{v} \Phi-\beta^{*}+\rho \sigma_{v}+\gamma_{1} \frac{1+e^{\eta_{1} T}}{1-e^{\eta_{1} T}}} \tag{A20}
$$

and 

$$
\gamma_1 = \sqrt{(\rho \sigma_v \Phi - \beta^* + \rho \sigma_v)^2} - \sigma_v^2 (\Phi + \Phi^2). \tag{A21}
$$

## References 

Akgiray, V., and G. G. Booth, 1988, “Mixed Diffusion-Jump Process Modeling of Exchange Rate Movements,”Review ofEconomics and Statistics,70,631-637.

Bailey, W., and R. M. Stulz, 1989, "The Pricing of Stock Index Options in a General Equilibrium Model,"JournalofFinancialandQuantitativeAnalysis,24,1-12.

Baillie, R. T., and T. Bollerslev, 1989, "The Message in Daily Exchange Rates: A Conditional VarianceTale,"Journal ofBusiness andEconomicStatistics,7,297-305.

Bates, D. S., 1988, “Pricing Options on Jump-Diffusion Processes," Working Paper 37-88, Rodney L.   
White Center, Wharton School, University of Pennsylvania, October.

<!-- Page:36 -->

Bates, D. S., 1991, "The Crash of '87: Was It Expected? The Evidence from Options Markets," Journal of Finance, 46, 1009-1044.

Bates, D. S., 1994, "Dollar Jump Fears, 1984-1992: Distributional Abnormalities Implicit in Currency Futures Options", working paper, Wharton School, University of Pennsylvania; forthcoming in Journal of International Money and Finance.

Benhamifti for the Early Exercise Premium Applied to Foreign Currency Options, in Essays in International Finance, Wharton School dissertation, University of Pennsylvania, chap. 1.

Bodurtha and G. Couadon, Test of American Pricing Model in Foreign Currency Options Market, Journal of Financial and Quantitative Analysis, 22, 153-167.

Bollerslev, T., R. Y-Chou, and K. F. Kroner, 1992, "ARCH Modeling in Finance," Journal of Econometrics, 52, 5-59.

Borensztein, E. R., and M. P. Dooley, 1987, "Options on Foreign Exchange and Exchange Rate Expectations," IMF Staff Papers, 34, 642-680.

Bossaerts, P. and P. H. Hillion, "A Test of a General Equilibrium Stock Option Pricing Model", Mathematical Finance, 3, 311-348.

Campa, J. M. and P. Chang, 1995, Testing Expectations Hypothesis on the Term Structure of Implied Volatilities in Foreign Exchange Options, Journal of Finance, 50, 529-547.

Canina and S. Figlewski, 1993, The Informational Content of Implied Volatility, Review of Financial Studies, 6, 659-682.

Carr, P., 1992, Pricing Foreign Currency Options with Stochastic Volatility, working paper, University of Chicago.

Chesney, M. and M. Scott, 1989, Pricing European Currency Options: A Comparison of the Modified Black-Scholes Model and a Random Variance Model, Journal of Financial and Quantitative Analysis, 24, 267-284.

Cox, J. C., J. E. Ingersoll, Jr., and S. A. Ross, 1985, "A Theory of the Term Structure of Interest Rates," Econometrica, 53, 385-407.

Cox, J. C., and S. A. Ross, 1976, "The Valuation of Options for Alternative Stochastic Processes," Journal of Financial Economics, 3, 145-166.

Day, T. E., and C. M. Lewis, 1992, "Stock Market Volatility and the Information Content of Stock Index Options," Journal of Econometrics, 52, 267-287.

Dumas, B., 1989, "Two-Person Dynamic Equilibrium in the Capital Market," Review of Financial Studies, 2, 157-188.

Engle, R. F., and C. Mustafa, 1992, "Implied ARCH Models from Options Prices," Journal of Econometrics, 52, 289-311.

Fleming, "The Information Content of Implied Volatility by Index Prices," working paper, Fuqua School of Business, Duke University.

French, K. R., and R. H. Thaler, 1990, "Anomalies: Foreign Exchange," Journal of Economic Perspectives, 4, 179-192.

Garman, M. B., and S. W. Kohlhagen, 1983, "Foreign Currency Option Values," Journal of International Money and Finance, 2, 231-237.

Heston, S. L., 1993, "A Closed-Form Solution for Options with Stochastic Volatility with Applications to Bond and Currency Options," Review of Financial Studies, 6, 327-344.

---

106

<!-- Page:37 -->

Hodrick, R. J., 1987, The Empirical Evidence on the Efficiency of Forward and Futures Foreign Exchange Markets, Harwood Academic Publishers, New York.

Hsieh, D. A., 1984, "Tests of Rational Expectations and No Risk Premium in Forward Exchange Markets," Journal of International Economics, 17, 173-184.

Hsieh, D. A, 1988, "The Statistical Properties of Daily Foreign Exchange Rates: 1974-1983," Journal of International Economics, 24, 129-145.

Hull, J., and A. White, 1987, "The Pricing of Options on Assets with Stochastic Volatility," Journal of Finance, 42, 281-300.

Hull, J., and A. White, 1988, "An Analysis of the Bias in Option Pricing Caused by Stochastic Volatility," Advances in Futures and Options Research, 3, 29-61.

Ingersoll, J. E., Jr, 1987, Theory of Financial Decision Making, Rowman & Littlefield, Savage, Md

Jorion, P., 1988, "On Jump Processes in the Foreign Exchange and Stock Markets," Review of Financial Studies, 1, 427-445.

Kendall, M. G., J. K. Ord, and A. Stuart, 1987, Kendall's Advanced Theory of Statistics (5th ed.), Oxford University Press, New York.

Lamoureux, C. G., and W. D. Lastrapes, 1993, "Forecasting Stock-Return Variance: Toward an Understanding of Stochastic Implied Volatilities," Review of Financial Studies, 6, 293-326.

McCulloch, J. H., 1987, "Foreign Exchange Option Pricing with Log-Stable Uncertainty," in S. J. Khoury and G. Aio (eds.), Recent Developments in International Banking and Finance, Lexington Books, Lexington, Mass.

Meese, R. A., 1986, "Testing for Bubbles in Exchange Markets: A Case of Sparkling Rates?" Journal of Political Economy, 94, 345-373.

Melino, A., and S. M. Turnbull, 1990, "Pricing Foreign Currency Options with Stochastic Volatility," Journal of Econometrics, 45, 239-265.

Merton, R. C., 1976, "Option Pricing When Underlying Stock Returns are Discontinuous," Journal of Financial Economics, 3, 125-144.

Omberg, E., 1988, "Efficient Discrete Time Jump Process Models in Option Pricing," Journal of Financial and Quantitative Analysis, 23, 161-174.

Rogalski, R. J., and J. D. Vinso, 1978, "Empirical Properties of Foreign Exchange Rates," Journal of International Business Studies, 9, 69-79.

Scott, L. O., 1992, "The Information Content of Prices in Derivative Security Markets," IMF Staff Papers, 39, 596-625.

Scott, L. O., 1993, "Pricing Stock Options in a Jump-Diffusion Model with Stochastic Volatility and Interest Rates: Applications of Fourier Inversion Methods," working paper, University of Georgia.

Shastri, K., and Kethyavivom, 1987, "The Valuation of Currency Options for Alternate Stochastic Processes," Journal of Financial Research, 10, 283-293.

Stein, E. M., and J. C. Stein, 1991, "Stock Price Distributions with Stochastic Volatility: An Analytic Approach," Review of Financial Studies, 4, 727-752.

Stein, J. C., 1989, "Overreactions in the Options Market," Journal of Finance, 44, 1011-1023.

Westerheld, J. M., 1977, "Empirical Properties of Foreign Exchange Rates Under Fixed and Floating Rate Regimes," Journal of International Economics, 7, 181-200.

<!-- Page:38 -->