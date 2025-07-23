# The jump-risk premia implicit in options: evidence from an integrated time-series study

The jump-risk premia implicit in options:
evidence from an integrated time-series study
Jun Pann
Sloan School of Management, Massachusetts Institute of Technology, Cambridge, MA 02142, USA
Received 14 August 2000; received in revised form 4 April 2001
Abstract
This paper examines the joint time series of the S&P 500 index and near-the-money shortdated
option prices with an arbitrage-free model, capturing both stochastic volatility and
jumps. Jump-risk premia uncovered from the joint data respond quickly to market volatility,
becoming more prominent during volatile markets. This form of jump-risk premia is
important not only in reconciling the dynamics implied by the joint data, but also in
explaining the volatility ‘‘smirks’’ of cross-sectional options data. r 2002 Elsevier Science
S.A. All rights reserved.
JEL classification: G12
Keywords: Option pricing; Stochastic volatility; Jump-risk premium; Implied-state generalized method of
moments; Volatility ‘‘smiles’’ and ‘‘smirks’’
$I benefited from discussions with professors and doctoral students in the finance program at Stanford
University. I am especially grateful to my advisers, Darrell Duffie and Ken Singleton, who inspired me to
take on this project, and helped with their insightful comments and warm encouragement. I also benefited
from extensive discussions with Jun Liu, as well as comments from two anonymous referees, Andrew Ang,
David Bates, Joe Chen, Mark Ferguson, Peter Glynn, Harrison Hong, Ming Huang, Mike Johannes,
George Papanicolaou, Monika Piazzesi, Tom Sargent, and seminar participants at Stanford, Berkeley,
MIT, UCLA, HBS, Rochester, Wisconsin Madison, Michigan, Duke, Kellogg, Chicago, Columbia, the
Stanford Financial Engineering Workshop, Cornell, Minnesota, the Conference on Risk Neutral and
Objective Probability Distributions, Boston College, and the 2001 AFA meetings. This paper was
previously circulated as ‘‘Integrated Time-Series Analysis of Spot and Option Prices.’’
n Tel.: +1-617-253-3083; fax: +1-617-258-6855

<!-- Page:0 -->

## 1. Introduction 

It has been widely documented that stock returns exhibit both stochastic volatility and jumps. The importance of such risk factors arises not only from time-series studies of stock prices, but also from cross-sectional studies of stock options (Bakshi et al., 1997; Bates, 2000). This brings us to ask an important question that was left unanswered by past studies: To what extent are such risk factors, namely volatility and jump risks, priced in the financial market? In particular, what is the market price of the jump risk? Is the jump risk priced differently from the diffusive risk? Answers to these questions have a direct impact on investors' decision-making, and could also shed some light on how investors react to various types of uncertainty.

In this paper, we address these issues by focusing on the risk premia implicit in the S&P 500 index options. Although there is a rich body of empirical studies on options, our understanding of the risk premia in options is still limited. In particular, the role of jump-risk premia in option pricing has not been examined to date.$^{2}$ In light of this, we adopt the Bates (2000) model, which extends the stochastic volatility model of Heston (1993) by incorporating state-dependent price jumps. Under such a setting, the S&P 500 index returns are affected by three distinctively different risk factors: (1) the diffusive price shocks, (2) the price jumps, and (3) the diffusive volatility shocks. The dynamic properties of such risk factors and, more important for our purpose, the market prices of such risk factors determine how options on the S&P 500 index are priced. To facilitate our analysis of how various risk factors are priced, we introduce a parametric pricing kernel to price all three risk factors, including the volatility risk and the jump risk. An important feature of the jump-risk premium considered here is that it is allowed to depend on the market volatility.

To estimate the price dynamics simultaneously with the parametric pricing kernel, we adopt an integrated approach to the time-series data on the S&P 500 index and options. Such an integrated approach has long been advocated in the literature, but its implementation has only been recent. For example, in a non-parametric setting, Ait-Sahalia et al. (2001) compare the risk-neutral densities estimated separately from spot prices and option prices. In a parametric setting, Chernov and Ghysels (2000) use joint time-series data to estimate the Heston (1993) model.

Our integrated approach differs from those adopted by earlier studies in that we device an ‘‘implied-state’’ generalized method of moments (IS-GMM) estimation strategy to take full advantage of the analytical tractability of the Bates (2000) model. For a given set $W$ of model parameters, we proxy for the unobserved volatility, $V_{t}$, with an option-implied volatility, $V_{t}^{\vartheta}$, inverted from the time-$t$ spot price, $S_{t}$, and a near-the-money short-dated option price, $C_{t}$, using the

---

See, for example, Jorion (1989), Andersen et al. (1998), Eraker et al. (2000), Chernov et al. (1999, 2000), and the references therein.

In pure-diffusion setings, the role of volatility-risk premia has been examined by Guo (1998), Benzoni (1998), Chernov and Ghysels (2000), Poteshman (1998), and Bakshi and Kapadia (2001). These studies, however, do not address the issue of jump-risk premia nor do they provide insight on the relative importance of the premia for jump and volatility risks.

<!-- Page:1 -->

model-implied option-pricing formula. Access to the option-implied stochastic volatility, $V^{9}$ ; allows us to explore the joint distribution of spot and option prices by focusing directly on the dynamic structure of the state variables: the stock price $S$ and the stochastic volatility $V$ : This approach is particularly attractive in our setting, as the conditional moment-generating function of $(S,V)$ is explicitly known, while the conditional distribution of $(S,C)$ could be complicated because of the nonlinearity of option pricing.

Under such an integrated approach, the role of risk premia arises naturally as we attempt to reconcile the dynamics implied by the joint time series $\{S_{t},~C_{t}\}$ of the S&P 500 index and the near-the-money short-dated option prices. For example, for a model in which neither jump risk nor volatility risk is priced, strong inconsistency arises between the level of volatility observed in the spot market and that implied, through the model, by the options market. In particular, the option-implied volatility is too high to be rationalized by the ex-post realized volatility observed in the spot market. Similar findings are reported by Jackwerth and Rubinstein (1996) in the setting of the Black and Scholes (1973) model. One natural explanation for this bias is that option prices contain a risk-premium component associated with additional risk factors such as stochastic volatility and jumps. Allowing for a volatility-risk premium, and fitting the stochastic-volatility model of Heston (1993) to the joint time-series data $\left\{S_{t},\thinspace C_{t}\right\}$ ; we find a significant volatility-risk premium, as well as an improvement in goodness-of-fit. Overall, however, the model is still rejected by the joint data. Moreover, the volatility-risk premium thus estimated from the joint time-series data implies an explosive volatility process under the ‘‘riskneutral’’ measure, leading to severely overpriced long-dated options.

Given the poor performance of the model with volatility-risk premia, an alternative approach is to introduce jump and jump-risk premium to the Heston (1993) model. Indeed, fitting the Bates (2000) model (with a state-dependent jumprisk premium) to the joint time-series data $\{S_{t},~C_{t}\}$ ; we find a significant premium for jump risk. In contrast to the case with volatility-risk premium, the model is not rejected by the joint time-series data, and the estimated level of jump-risk premium does not result in any distortion of the long-dated option prices. Finally, when allowing both types of risk premia to reconcile simultaneously the spot and option dynamics, we find that the state-dependent jump-risk premium dominates by far the volatility-risk premium.

In addition to the joint time-series data $\left\{S_{t},\thinspace C_{t}\right\}$ that have so far been the focus of our model estimation and empirical analyses, we also observe on each date $t$ a crosssection of options with varying degrees of moneyness and maturities. This rich set of options data provides a challenging test of our empirical results. Using the model parameters estimated exclusively from the joint time series $\left\{S_{t},\mathbf{\Xi}C_{t}\right\}$ of one spot and one option, we find that the Bates (2000) model explains the cross-sectional options data surprisingly well, capturing, in particular, the changes over time of the ‘‘smirk’’ patterns that are exhibited in options with different moneyness. Again, the key component here is the state-dependent jump-risk premium, under which small negative jumps in the actual dynamics are perceived to be significantly more negative in the ‘‘risk-neutral’’ measure. The importance of such negative ‘‘risk-neutral’’ jumps

<!-- Page:2 -->

in capturing the ‘‘smirk’’ patterns has also been documented by Bakshi et al. (1997) and Bates (2000). We reach to the same conclusion, however, in different ways. While their model estimates (the ‘‘risk-neutral’’ part) are obtained by fitting directly to the entire cross-sectional options, ours are estimated using the time series $\left\{S_{t},C_{t}\right\}$ of only one spot and one option. While their empirical implication stays at the level of the ‘‘risk-neutral’’ dynamics, ours goes one step further by noting that volatility ‘‘smirks’’ are primarily due to investors’ fear of large adverse price jumps. Moreover, given that the jump-risk premium is, in fact, estimated using near-the-money option prices, our results show that such fear of jump risk is reflected not only in deep outof-the-money (OTM) puts, but in near-the-money options as well.

To understand the pricing kernel that links the two markets, the spot and options data can be exploited in alternative ways. Under a consumption-based asset pricing setting, Jackwerth (2000) and Ait-Sahalia and Lo (2000) uncover the risk-aversion coefficient for a representative agent by comparing the risk-neutral distribution implied by index options with the actual distribution estimated from the time series of index. In the same spirit, Rosenberg and Engle (1999) estimate an empirical pricing kernel. In this paper, we rely instead on an arbitrage-free asset pricing model with a parametric pricing kernel that prices diffusive return shocks, volatility shocks, and jump risks. Different risk factors would have different impacts on option prices, and the compensation for their uncertainty could also be reflected in very different ways through option pricing. By allowing investors to have different risk attitudes toward the three types of risk factors, our parametric approach to the pricing kernel allows us to investigate such differences. Indeed, our empirical results indicate that investors might have distinctly different risk attitudes toward jump risk and diffusive risk.

Finally, it should be noted that our empirical results build on the premise that the options market is fully integrated with the spot market, sharing the same price dynamics and the same market prices of risks. If the options market is somehow segmented from the spot market because of some option-specific factors such as liquidity, it then becomes impossible to identify the parametric pricing kernel in our current setting. In a related issue, Jackwerth and Rubinstein (1996) raise the possibility of a ‘‘peso’’ component (extreme and rare events) in option prices, which is found to be important by Ait-Sahalia et al. (2001). Given that jumps are inherently infrequent, and our sample period is relatively short, it is empirically hard to separate the ‘‘peso’’ hypothesis from that of jump-risk premia. In principle, however, these two hypotheses are fundamentally different. The ‘‘peso’’ explanation implies that OTM put options are priced with premia because of the potential occurrence of extreme events, which have not yet been materialized. By contrast, the risk-premia explanation emphasizes investors’ aversion to such extreme events – options (especially OTM put options) are priced with premia not only because of the likelihood and magnitude of such rare events, but also because of investors’ aversion to such events.

The remainder of this paper is organized as follows. Section 2 specifies the Bates (2000) model, the parametric pricing kernel, and the option-pricing formula. Section 3 outlines the integrated approach adopted in this paper and provides details

<!-- Page:3 -->

on the estimation strategy. Section 4 describes the data. Section 5 summarizes the empirical findings. Section 6 concludes the paper. Technical details are provided in appendices.

## 2. The model

We adopt the Bates (2000) model to characterize the stock return dynamics. As summarized in Section 2.1, this model introduces three sources of uncertainty to the underlying price dynamics: (1) diffusive return shocks, (2) volatility shocks, and (3) jump risks.[^1] The market prices of these risk factors are characterized in Section 2.2. A brief description of option pricing under this dynamic setting is presented in Section 2.3. Details about the state-price density that gives rise to the market prices of risks are given in Appendix A, and additional information about option pricing is provided in Appendix B.

### 2.1. The data-generating process

We fix a probability space $(\Omega,{\mathcal{F}},P)$ and an information filtration $(\mathcal{F}_{t})$ satisfying the usual conditions (see, for example, Protter, 1990), and let $S$ be the ex-dividend price process of a stock that pays dividends at a stochastic proportional rate $q$ : Adopting the model of Bates (2000), we assume the following data-generating process for the stock price $S$

$$
\begin{aligned} \mathrm{d}S_t &= \left[r_t - q_t + \eta^s V_t + \lambda V_t (\mu - \mu^*)\right] S_t \, \mathrm{d}t + \sqrt{V_t} S_t \, \mathrm{d}W_t^{(1)} \\ &\quad + \mathrm{d}Z_t - \mu S_t \lambda V_t \, \mathrm{d}t, \end{aligned} \tag{2.1}
$$

$$
\mathrm{d}V_t = \kappa_v(\bar{v} - V_t)\,\mathrm{d}t + \sigma_v\sqrt{V_t}\Big(\rho\,\mathrm{d}W_t^{(1)} + \sqrt{1 - \rho^2}\,\mathrm{d}W_t^{(2)}\Big), \tag{2.2}
$$

where $r$ is a stochastic interest-rate process, $W=[W^{(1)},W^{(2)}]^{\top}$ is an adapted standard Brownian motion in $\mathbb{R}^{2}$ ; and $Z$ is a pure-jump process.

This model captures two important features of the stock return dynamics, namely stochastic volatility and price jumps, and still provides analytical tractability for option pricing and model estimation. First, stochastic volatility is modeled by the autonomous process $V$ defined by Eq. (2.2), which is a one-factor ‘‘square-root’’ process with constant long-run mean $\bar{v}$ ; mean-reversion rate $\kappa_{v}$ ; and volatility coefficient $\sigma_{v}$ :[^2] This volatility specification, introduced by Heston (1993), allows the ‘‘Brownian’’ shocks to price $S$ and volatility $V$ to be correlated with constant coefficient $\rho$ ; capturing an important stylized fact that stock returns are typically negatively correlated with changes in volatility (Black, 1976).

---

[^1]: To be more precise, this model involves five sources of uncertainty. As it becomes clear in Section 2.1, the two additional shocks are associated with the riskfree rate and the dividend yields.

[^2]: It should be noted that we call the variance $V$ the volatility, which is typically referred to as the standard deviation of returns. This change of terminology should not cause any confusion.

<!-- Page:4 -->

Second, this model captures price jumps via the pure-jump process $Z$ ; which contains two components: random jump-event times and random jump sizes. The jump-event times $\{\mathcal{T}_{i}:i\geqslant1\}$ arrive with a state-dependent stochastic intensity process $\{\lambda V_{t}:t\geqslant0\}$ for some non-negative constant $\lambda$: Given the arrival of the ith jump event, the stock price jumps from $S(\mathcal{T}_{i}-)$ to $S(\mathcal{T}_{i}-)\exp(U_{i}^{s})$ ; where $U_{i}^{s}$ is normally distributed with mean $\mu_{J}$ and variance $\sigma_{J}^{2}$ ; independent of $W$ ; of inter-jump times, and of $U_{j}^{s}$ for $j\neq i$ : Intuitively, the conditional probability at time $t$ of another jump before $t+\Delta t$ is, for some small $\Delta t$ ; approximately $\lambda V_{t}\Delta t$ and, conditional on a jump event, the mean relative jump size is $\mu=\operatorname{E}(\exp(U^{s})-1)=\exp(\mu_{J}+\sigma_{J}^{2}/2)-1$ : Combining the effects of random jump timing and sizes, the last term $\mu S_{t}\lambda V_{t}\mathrm{d}t$ in Eq. (2.1) compensates for the instantaneous change in expected stock returns introduced by the pure-jump process $Z$ :

Given that the pure-diffusion model of Heston (1993) cannot explain the tailfatness of the stock return distribution (Andersen et al., 1998), nor can it explain the ‘‘smirkiness’’ exhibited in the cross-sectional options data (Bakshi et al., 1997; Bates, 2000), the extension to include jumps is well motivated. It should be emphasized, however, that our main motivation is to study how such jump risks are priced and, in particular, their role in reconciling the spot and option dynamics. As will become evident in the next section, we choose the linear specification $\lambda V$ of jump-arrival intensity to allow for a state-dependent jump-risk premium, i.e., to allow for the possibility that when the market is more volatile, the jump-risk premium implicit in option prices becomes higher.

Focusing on the drift component of the stock price dynamics, we see that the stock price appreciates with interest rate $r_{t}$ ; pays out dividend rate $q_{t}$ ; and appreciates with two risk-premium components: $\eta^{s}V_{t}$ and $\lambda V_{t}(\mu-\mu^{*})$ ; which are associated with the premia for ‘‘Brownian’’ return risks and jump risks, respectively. We postpone a formal discussion on the risk-premium components to Section 2.2.

The short interest-rate process $r$ is of the type modeled by Cox et al. (1985). Specifically, $r$ and the dividend-rate process $q$ are defined by

$$
d r_t = \kappa_r (\bar{r} - r_t) \, dt + \sigma_r \sqrt{r_t} \, dW^{(r)}_t
$$

$$
\mathrm{d}q_t = \kappa_q (\bar{q} - q_t) \, \mathrm{d}t + \sigma_q \sqrt{q_t} \, \mathrm{d}W_t^{(q)}, \tag{2.3}
$$

where $W^{(r)}$ and $W^{(q)}$ are independent adapted standard Brownian motions in $\mathbb{R}$ ; independent also of $W$ and $Z$ : Similar to the stochastic-volatility process $V$ ; both $r$

---

This jumpmodelis of the Cox-procestype. Conditional on the path of $V$ ; jump arrivals are Poisson with time-varying intensity $\{\lambda V_{t}:t\geqslant0\}$ . See, for example, Bremaud (1981).

$^6\mathrm{It}$ should be noted that to maintain a parsimonious model, we leave out the constant component in jump arrival intensity. Using stock return data alone, evidence in support of state-dependent jump arrival intensity is documented by Johannes et al. (1998), while the studies of Chernov et al. (1999) and Andersen et al. (1998) emphasize the importance of the constant component. For the purpose of reconciling spot and option dynamics, we find the state-dependent component to play a dominating role. The constraint of zero constant component will be formally tested in Section 5.1. In addition to the linear specification, the case of nonlinear dependency of the arrival intensity on $V$ seems interesting, so is the case of state-dependent jump sizes. For analytical tractability, however, these specifications are not considered here.

<!-- Page:5 -->

and $q$ are autonomous one-factor square-root processes with constant long-run means $\bar{r}$ and $\bar{q}$, mean-reversion rates $\kappa_{r}$ and $\kappa_{q}$, and volatility coefficients $\bar{\sigma}_{r}$ and $\sigma_{q}$.

We choose to treat $r$ and $q$ as stochastic processes, as opposed to time-varying constants, in order to accommodate stochastic interest rates and dividend yields, which vary in the data, and whose levels indeed affect even short-dated option prices. Our formulation of $r$ and $q$; however, precludes possible correlation between the two, as well as more plausible and richer dynamics for the short-rate process. But for the short-dated options used to fit our model, the particular stochastic nature of interest rates $r$ and dividend yields $q$ plays a relatively minor role.

Finally, one limitation of our volatility specification is that it does not allow volatility to jump, a feature that is found to be important in stock returns (Eraker et al., 2000). In an issue that is related, Jones (1999) points out that, compared with the constant elastic variance (CEV) model, the square-root specification does not allow volatility to increase fast enough. The severity of these limitations will be investigated in Section 5.4 by diagnostic tests on the volatility dynamics. Their implications on our understanding of the jump-risk premia will also be discussed. Overall, to maintain a parsimonious model is the main reason why volatility jumps are not considered here, and the CEV specification is not incorporated for analytical tractability.$^{7}$

### 2.2. The market prices of risks

In contrast to the complete market setting of Black and Scholes (1973), the additional sources of uncertainty, in particular, the random jump sizes, introduced in our setting make the market incomplete with respect to the riskfree bank account, the underlying stock, and the finite number of options contracts. Consequently, the stateprice density (or pricing kernel) is not unique. Our approach is to focus on a candidate pricing kernel that prices the three important sources of risks: diffusive price shocks, jump risks, and volatility shocks.$^{8}$ Given their mild effects on short-dated option prices, the interest-rate and dividend-rate risks are not priced in this paper.

For exposition purpose, we present in this section the ‘‘risk-neutral’’ price dynamics defined by our candidate pricing kernel, leaving a detailed description of the pricing kernel in Appendix A. Letting $Q$ be the equivalent martingale measure

---

$^{7}$Alternative models also include the log-normal model of Hull and White (1987). In fact, using highfrequency stock return data, Andersen et al. (2001) suggest that volatility is best described as a log-normal process. One disadvantage of such a model, however, is that once the negative correlation between stock returns and volatility is incorporated, option pricing becomes intractable. Moreover, Benzoni (1998) shows that for the purpose of option pricing, there is no qualitative difference between the log-normal model and the square-root model. An alternative approach is preference-based equilbrium pricing, for which the state-price density arises from marginal rates of substitution evaluated at equilibrium consumption streams. See Lucas (1978). Also, see Naik and Lee (1990) for an extension to jumps, Pham and Touzi (1996) for an extension to stochastic volatility, and Detemple and Selden (1991) for an analysis of the interactions between options and stock markets.

<!-- Page:6 -->

associated with our candidate pricing kernel, we assign the market prices of risks so that both $r$ and $q$ have the same joint distribution under $Q$ as under the datagenerating measure $P$ ; and the dynamics of $(S,V)$ under $Q$ are of the form

$$
\mathrm{d}S_t = [r_t - q_t]S_t \, \mathrm{d}t + \sqrt{V_t}S_t \, \mathrm{d}W_t^{(1)}(Q) + \mathrm{d}Z_t^Q - \mu^* S_t \lambda V_t \, \mathrm{d}t \tag{2.4}
$$

$$
\mathrm{d} V_{t} = [\kappa_{\nu}(\bar{v} - V_{t}) + \eta^{\nu} V_{t}] \, \mathrm{d}t + \sigma_{\nu} \sqrt{V_{t}} \Big( \rho \, \mathrm{d} W_{t}^{(1)}(\mathcal{Q}) + \sqrt{1 - \rho^{2}} \, \mathrm{d} W_{t}^{(2)}(\mathcal{Q}) \Big), \tag{2.5}
$$

where $W(Q)=[W^{(1)}(Q),W^{(2)}(Q)]$ is a standard Brownian motion under $Q$ : [See Appendix A for a formal definition of $W(Q).]$ The pure-jump process $Z^{Q}$ has a distribution under $Q$ that is identical to the distribution of $Z$ under $P$ defined in Eq. (2.1), except that under $Q$ ; the jump arrival intensity is $\{\lambda V_{t}:t\geqslant0\}$ for some non-negative constant $\lambda$ ; and the jump amplitudes $U_{i}^{s}$ is normally distributed with $Q$ -mean $\mu_{J}^{*}$ and $Q$ -variance $\sigma_{J}^{2}$ : In other words, under the risk-neutral measure, the conditional probability at time $t$ of another jump before $t+\Delta t$ is approximately $\lambda V_{t}\Delta t$ and, conditional on a jump event, the risk-neutral mean relative jump size is $\mu^{*}=\operatorname{E}^{Q}(\exp{(U^{s})}-1)=\exp(\mu_{J}^{*}+\sigma_{J}^{2}/2)-1$ : Following the same discussion for the data-generating process, we see that the last term $\mu^{*}S_{t}\lambda V_{t}\mathrm{d}t$ in Eq. (2.4) is the compensator for the pure-jump process $Z^{Q}$ under the risk-neutral measure. Consequently, the instantaneous risk-neutral expected rate of stock return is the short interest rate $r$ minus the dividend payout rate $q$ :

Comparing the specification of the risk-neutral dynamics of $(S,V)$ with that of the data-generating process, one can obtain an intuitive understanding of how different risk factors are priced. Focusing first on the market prices of jump risks, we see that by allowing the risk-neutral mean relative jump size $\mu^{*}$ to be different from its datagenerating counterpart $\mu$ ; we accommodate a premium for jump-size uncertainty. Similarly, a premium for jump-timing risk can be incorporated if we allow the coefficient $\lambda^{*}$ for the risk-neutral jump-arrival intensity to be different from its datagenerating counterpart $\lambda$ : In this paper, however, we concentrate mainly on the risk premium for jump-size uncertainty, while ignoring the risk premium for jump-timing uncertainty by supposing $\lambda^{*}=\lambda$ : With this assumption, all jump risk premia will be artificially absorbed by the jump-size risk premium coefficient $\mu-\mu^{*}$ : The time- $t$ expected excess stock return compensating for the jump-size uncertainty is $\lambda V_{t}(\mu-\mu^{*})$ :

We adopt this approach mainly out of empirical concern over our ability to separately identify the risk premia for jump timing and jump size uncertainties. For example, the arrival intensity of price jumps, as well as the mean relative jump size $\mu$ ; could be difficult to pin down using the S&P 500 index data under a GMM estimation approach. In Section 5.2, this constraint of $\lambda^{*}=\lambda$ will be relaxed to gauge the relative importance of premia for jump-timing and jump-size risks.

Premia for the ‘‘conventional’’ return risks (‘‘Brownian’’ shocks) are parameterized by $\eta^{s}V_{t}$ for a constant coefficient $\eta^{s}$ : This is similar to the risk-return trade-off in a CAPM framework. Premia for ‘‘volatility’’ risks, on the other hand, are not as transparent, since volatility is not directly traded as an asset. Because volatility is,

<!-- Page:7 -->

itself, volatile, options may reflect an additional volatility risk premium. Volatility risk is priced via the extra term $\eta^{v}V_{t}$ in the risk-neutral dynamics of $V$ in Eq. (2.5). For a positive coefficient $\eta^{\upsilon}$; the time- $t$ instantaneous mean growth rate of the volatility process $V$ is, therefore, $\eta^{\upsilon}V_{t}$ higher under the risk-neutral measure $Q$ than under the data-generating measure $P$: Since option prices respond positively to the volatility of the underlying price in this model, option prices are increasing in $\eta^{\upsilon}$:

Our specification of risk premia can also be relaxed. For example, the linear form of the volatility-risk premia $\eta^{\upsilon}V_{t}$ could be relaxed by introducing the polynomial form $\eta_{0}+\eta_{1}V_{t}+\eta_{2}V_{t}^{2}+\cdots+\eta_{l}V_{t}^{l}$; for some constant coefficients $\eta_{0},\eta_{1},\eta_{2},...,\eta_{l}$: Our specification rules out the possibility that $\eta_{0}\neq0$; because it could imply nondiminishing risk premia as the volatility approaches to zero. The quadratic term $\eta_{2}V_{t}^{2}$ seems to be an interesting case, but is not examined in this paper for analytical tractability.

### 2.3. Option pricing

Let $\theta_{r}=[\kappa_{r},\bar{r},\sigma_{r}]^{\top}$; and $\theta_{q}=[\kappa_{q},\bar{q},\sigma_{q}]^{\top}$ denote the model parameters for the interest-rate process $r$ and the dividend-rate process $q$; respectively, and let W denote the rest of the model parameters:

$$
\theta = (\kappa_{\mathrm{D}}, \bar{v}, \sigma_{\mathrm{v}}, \rho, \lambda, \mu, \sigma_{J}, \eta^{s}, \eta^{\mathrm{v}}, \mu^{*}). \tag{2.6}
$$

Let $C_{t}$ denote the time- $t$ price of a European-style call option on $S$; struck at $K$ and expiring at $T=t+\tau$: Taking advantage of the affine structure of $(\ln S,V,r,q)$ and using the transform-based approach (see, for example, Stein and Stein, 1991; Heston, 1993; Scott, 1997; Bates, 2000; Bakshi et al., 1997; Bakshi and Madan, 2000; Duffie et al., 2000), we have

$$
C_t = \mathbb{E}_t^Q \left[ \exp \left( - \int_t^T r_u \, \mathrm{d}u \right) (S_T - K)^+ \right] = S_t f \left( V_t, \theta, r_t, q_t, \tau, \frac{K}{S_t} \right), \tag{2.7}
$$

where an explicit formulation for $f$ is given in Appendix $\mathbf{B}$, and where for notational simplicity, we omit the explicit dependency of $f$ on $\theta_{r}$ and $\theta_{q}$:

## 3. Estimation

In this section, we focus on how to estimate the parametric model specified in Section 2 using the joint time-series data $\{S_{n},~C_{n}\}$ on spot and options. For notational convenience, we summarize the model parameters by $\vartheta$; as defined in Eq. (2.6). Treating the parameters $\theta_{r}$ and $\theta_{q}$ associated with the interest-rate process $r$ and the dividend-rate process $q$ as given,$^{9}$ our focus in this section is on the

---

9 In practice, we first obtain maximum-likelihood (ML) estimates of $\theta_{r}$ and $\theta_{q}$ using time series of interest rates and dividend yields, respectively. We then treat the ML estimates of $\theta_{r}$ and $\theta_{q}$ as true parameters and adopt the “implied-state” GMM estimation strategy outlined here. Any loss of efficiency as a result of this approach is expected to be small, because the particular stochastic natures of $r$ and $q$ play a relatively minor role in pricing the short-dated options.

<!-- Page:8 -->

estimation of the true model parameter $\boldsymbol{\vartheta}_{0}$ ; which is assumed to live in a compact parameter space $\boldsymbol{\Theta}$ :

Given that options are non-linear functions of the state variables, the joint dynamics of the market observables $S_{n}$ and $C_{n}$ could be complicated, irrespective of the analytical tractability of the state variables $(S,V)$ . In order to take advantage of the analytical tractability of the state variables, we propose an ‘‘implied-state’’ generalized method of moments (IS-GMM) approach. The basic idea of our approach is to take advantage of the option-pricing relation $C_{n}=$ $S_{n}f(V_{n},\mathcal{H}_{0})$ by inverting, for a given set of model parameters W; a proxy $V_{n}^{9}$ for the unobserved volatility $V_{n}$ through $C_{n}=S_{n}f(V_{n}^{\vartheta},\vartheta)$ : Using $V_{n}^{\vartheta}$ ; we can focus directly on the dynamic structure of the state variables $(S,V)$ . In our setting, the affine structure of $(\ln S,V)$ allows us to calculate the joint conditional momentgenerating function of stock returns and volatility in closed-form, which, in turn, yields a rich set of moment conditions. Replacing $V_{n}$ by $V_{n}^{9}$ in the moment conditions, we can perform the usual GMM estimation, the only difference being that one of the state variables $V^{\vartheta}$ is parameter-dependent, hence the term ‘‘impliedstate’’ GMM.

In the remainder of this section, we will first provide a detailed description of the IS-GMM estimators and then discuss the selection of the optimal moment conditions. The large sample properties of the IS-GMM estimators are established in Appendix C. A recursive formula for calculating the joint conditional moments of return and volatility is given in Appendix D.

### 3.1. ‘‘Implied-state’’ GMM estimators

Fixing some time interval $\varDelta$ ; we sample the continuous-time state process $\{S_{t},~V_{t},~r_{t},~q_{t}\}$ at discrete times $\{0,\varDelta,2\varDelta,...,N A\}$ and denote the sampled process $\{S_{n\underline{{{A}}}},~V_{n\underline{{{A}}}},~r_{n\underline{{{A}}}},~q_{n\underline{{{A}}}}\}$ by $\{S_{n},~V_{n},~r_{n},~Q_{n}\}$ : Letting

$$
y_n = \ln S_n - \ln S_{n-1} - \int_{(n-1)\Delta}^{n\Delta} (r_u - q_u) \, \mathrm{d}u \tag{3.1}
$$

denote the date- $\cdot n$ ‘‘excess’’ return,10 it is easy to see that the transition distribution of $\{y_{n},~V_{n}\}$ depends only on the parameter vector W; and not on $\theta_{r}$ or $\theta_{q}$ : Suppose, for the moment, that both the stock return $y_{n}$ and volatility $V_{n}$ can be observed. Our estimation problem then falls into a standard GMM setting. Specifically, we can select $n_{h}$ moment conditions such that

$$
\mathbf{E}_{n-1}^{\theta_{0}}\left[h\left(y(n, n_{y}),\ V(n, n_{v}),\ \theta_{0}\right)\right] = 0, \tag{3.2}
$$

---

n order to construct the excess-retun process $y$ defined by Eq. (3.1), we need to observe, at any time $t$ , the continuous-time processes $r$ and $q$ . In practice, however, we observe $r$ and $q$ at a fixed time interval 4. In our estimation, we use $\tilde{y}_{n}=\ln S_{n}-\ln S_{n-1}-(r_{n-1}-q_{n-1})A$ as a proxy for $y_{n}$ : For a relatively short time interval $\varDelta$ (our data are weekly), the effect of this approximation error on our results is asumed to be small Altrnative proxies for $\begin{array}{r}{\int_{(n-1)\varDelta}^{n\varDelta}(r_{t}-q_{t})\mathrm{d}t}\end{array}$ ; such as $(r_{n}-q_{n})\varDelta$ and $[(r_{n}+r_{n-1})/2-$ $(q_{n}+q_{n-1})/2]\varDelta$ , are also considered. The empirical results reported in this paper are robust with respect to all three proxies.

<!-- Page:9 -->

where $\vartheta_{0}$ is the true model parameter, $h:\mathbb{R}^{n_{y}}\times\mathbb{R}_{+}^{n_{v}}\times\theta\rightarrow\mathbb{R}^{n_{h}}$ is some test function to be chosen, $\mathrm{E}_{n-1}^{9}$ denotes $\mathcal{F}_{(n-1)A}$ -conditional expectation under the transition distribution of $(y,V)$ associated with parameter W; and, for some positive integers $n_{y}$ and $n_{v}$ ;

$$
y(n, n_y) = \left[ y_n, y_{n-1}, \dots, y_{n-n_y+1} \right]^\top \quad \text{and} \quad V(n, n_v) = \left[ V_n, V_{n-1}, \dots, V_{n-n_v+1} \right]^\top
$$

denote the ${}^{\leftarrow}n_{y}$ -history'' of $y$ and the $^{\leftarrow}n_{v}$ -history'' of $V$ ; respectively.

What distinguishes our situation from that of a typical GMM is that we do not observe the stock volatility $V_{n}$ directly. We can, nevertheless, take advantage of the market-observed spot price $S_{n}$ and option price $C_{n}$ ; and exploit the option-pricing relation

$$
C_{n}=S_{n}f(V_{n},~\vartheta,~r_{n},~q_{n},~\tau,k).\eqno(3.3)
$$

for an option with maturity $\tau$ and strike-to-spot ratio $k=K/S_{n}$ : If the true model parameter $\boldsymbol{\vartheta}_{0}$ is known, we can, in fact, back out the true volatility $V_{n}$ from this pricing relation using the market observables. For any other set of model parameters $\vartheta\in\Theta$ ; however, we can still back out a proxy $V_{n}^{9}$ for the unobserved volatility $V_{n}$ by solving $V_{n}^{9}$ from

$$
C_{n} = S_{n} f(V_{n}^{g}, \partial, r_{n}, q_{n}, \tau, \kappa). \tag{3.4}
$$

The concept of backing out volatility from option prices is not novel, a prominent example being the Black–Scholes implied volatility. Our version of option-implied volatility $V_{n}^{9}$ differs from that of Black–Scholes in that ours is parameter dependent. Suppose that both volatility risk and jump risk are priced in the true model $\boldsymbol{\vartheta}_{0}:\boldsymbol{\eta}^{v}\neq0$ and $\mu^{*}\neq\mu$ : If we start from a parameter set $\mathrm{\Omega}^{\mathstrut}\mathrm{\mathcal{S}}^{\prime}$ that excludes jump risk and volatility risk from being priced, then the option-implied volatility $\bar{V_{n}^{9^{\prime}}}$ will be very different from the true volatility $V_{n}$ : Alternatively, the closer W is to the true model parameter $\boldsymbol{\vartheta}_{0}$ ; the more accurate is the corresponding option-implied volatility $V_{n}^{9}$ : When $V_{n}^{9}$ is evaluated at the true model parameter $\vartheta_{0}$ ; we retrieve the true volatility $V_{n}$ :

Given the option-implied volatility $V_{n}^{9}$ ; we can now construct the sample analogue of the moment condition Eq. (3.2) by

$$
G_N(\vartheta) = \frac{1}{N} \sum_{n \leqslant N} h\left(y_{(n, n_y)}, V_{(n, n_v)}^\vartheta, \vartheta\right), \tag{3.5}
$$

and define the ‘‘implied-state’’ GMM estimator $\hat{\mathcal{A}}_{N}$ by

$$
\hat{\theta}_N = \arg \min_{\theta \in \Theta} G_N(\theta)^{\top} \mathcal{W}_N G_N(\theta) \tag{3.6},
$$

where $\{\mathcal{W}_{n}\}$ is an $(\mathcal{F}_{n A})$ -adapted sequence of $n_{h}\times n_{h}$ positive semi-definite distance matrices.

This ‘‘implied-state’’ GMM approach raises several econometric issues. For example, one inherent feature of the exchange-traded options is that certain contract variables, such as time $\tau$ to expiration and strike-to-spot ratio $k$ ; vary from one observation to the next. This time dependency in contract variables could potentially

---

We assume that $h$ is continuusly diffretiabe and intrable in the sene ofEq (32.

<!-- Page:10 -->

introduce a time dependency in the option-implied volatility, inadvertently resulting in an additional layer of complexity. In Appendix C, we show that, under mild technical conditions, the IS-GMM estimators are, indeed, consistent and asymptotically normal. 

This IS-GMM approach falls into a group of estimation strategies for state variables that can only be observed up to unknown model parameters.$^{12}$ For example, Renault and Touzi (1996) propose an MLE-based two-step iterative procedure; Pastrorello et al. (1996) apply simulated method of moments (SMM) to time series of spot and option prices separately; Chernov and Ghysels (2000) adopt the SNP/EMM empirical strategy developed by Gallant and Tauchen (1998) and apply a simultaneous time-series estimation of spot and option prices; and, more recently, Eraker (2000) applies a Markov chain Monte Carlo based approach to joint time-series data on spot and options.$^{13}$

Compared with these alternative approaches, the main motivation for us to adopt the IS-GMM approach is to take advantage of the affine structure of our dynamic model. Specifically, it allows us to focus directly on the joint dynamics of the state variables $(S,V)$, rather than the market observables $(S_{n},C_{n})$, which could be highly non-linear functions of the state variables. This is particularly attractive in our specification, because the affine structure of $(\ln S,V)$ provides a closed-form solution for the joint conditional moment-generating function of the stock return and volatility $(y,V)$ (Duffie et al., 2000), from which the joint conditional moments of $(y,V)$ can be calculated up to any desired order. As will be demonstrated in the subsequent section, such conditional moments can be used directly or indirectly (as optimal instruments) to build moment conditions. Moreover, they provide a rich set of diagnostic tests, allowing an explicit examination of how well various model constraints, e.g., constraints on the risk premium, fit with the joint time-series data of spot and option prices.

Finally, although our approach relies on one option $C_{n}$ per day to back out $V_{n}^{9}$; it does not preclude the use of multiple options. In fact, in Section 5.2, we introduce, in addition to the time series $\left\{C_{n}\right\}$ of near-the-money short-dated option prices, a time series $\{C_{n}^{\mathrm{ITM}}\}$ of in-the-money call options to help identify jump-risk premium simultaneously with volatility-risk premium. But our approach does assume that this particular time series of option prices $\{C_{n}\}$ is measured precisely. This is partially the motivation for us to use near-the-money short-dated options, since they typically are the most liquid options.

---

12This econometric setting arises in many other empirical applications. For example, zero and coupon bond yields, exchange-traded interest-rate option prices, over-the-counter interest-rate cap and floor data, and swaptions can all, in principle, be employed to invert for an otherwise-unobserved multi-factor state variable that governs the dynamics of the short interest rate process. As another example, an increasingly popular approach in the literature (on defaultable bonds, in particular) is to model the uncertain mean arrival rate of economic events through some stochastic intensity process. (See, for example, Duffie and Singleton, 1999 and references therein.) If there exist market-traded instruments whose values are linked to such events, then the otherwise-unobserved intensity processes can be “backed out”. One advantage of this data for the approach is that are real data additions to making it convenient to draw inferences about jump occurrences.

<!-- Page:11 -->

### 3.2. ‘‘Optimal’’ moment selection

This section provides a set of ‘‘optimal’’ moment conditions that takes advantage of the explicitly known moment-generating function of return and volatility $(y,V)$ , which is defined, for any $u_{y}$ and $u_{v}$ in $\mathbb{R}$ ; by

$$
E_n\left[\exp\left(u_yy_{n+1}+u_vV_{v+1}\right)\right]=\phi\left(u_y,u_v,V_n\right). \tag{3.7}
$$

Given the explicitly known moment-generating function $\phi$ (see Appendix $\mathrm{D}$ ), the joint conditional moments of returns and volatility can be derived by

$$
\operatorname{E}_n\left(y_{n+1}^i V_{n+1}^j\right)=\left.\frac{\partial^{(i+j)}\phi\left(u_y,u_v,V_n\right)}{\partial^i u_y \partial^j u_v}\right|_{u_y=0,u_v=0}, \quad i,j\in\{0,1,\ldots\}.\tag{3.8}
$$

Direct computation of the derivatives in Eq. (3.8), albeit straightforward, can nonetheless be cumbersome for higher orders of $i$ and $j$ : Appendix $\mathbf{D}$ offers an easyto-implement method for calculating $\mathrm{E}_{n}(y_{n+1}^{i}V_{n+1}^{j})$ ; recursively in $i$ and $j_{\mathrm{:}}$ ; up to arbitrary orders.

We let $M_{1}(V_{n},\vartheta)=\mathrm{E}_{n}^{\vartheta}(y_{n+1})$ ; $M_{2}(V_{n},\vartheta)=\mathrm{E}_{n}^{\vartheta}\big(y_{n+1}^{2}\big)$ ; $M_{3}(V_{n},\vartheta)=\mathrm{E}_{n}^{\vartheta}\big(y_{n+1}^{3}\big)$ ; and $M_{4}(V_{n},\vartheta)=\mathrm{E}_{n}^{\vartheta}\bigl(y_{n+1}^{4}\bigr)$ denote the first four conditional moments of return, let $M_{5}(V_{n},\mathbb{\Psi})=\mathrm{E}_{n}^{\mathbb{J}}(\dot{V}_{n+1})$ and $M_{6}(V_{n},\vartheta)=\mathrm{E}_{n}^{\vartheta}\big(V_{n+1}^{2}\big).$ denote the first two conditional moments of volatility, and let $M_{7}(V_{n},\mathcal{\vec{y}})=\dot{\mathrm{E}}_{n}^{9}(y_{n+1}V_{n+1})$ denote the first cross moment of return and volatility. We start with the following moment conditions:

$$
\mathbf{E}_{n-1}^{3}(\boldsymbol{\varepsilon}_{n}) = 0, \quad \boldsymbol{\varepsilon}_{n} = \begin{bmatrix} \varepsilon_{n}^{y1}, & \varepsilon_{n}^{y2}, & \varepsilon_{n}^{y3}, & \varepsilon_{n}^{y4}, & \varepsilon_{n}^{v1}, & \varepsilon_{n}^{v2}, & \varepsilon_{n}^{yv} \end{bmatrix}^\top, \tag{3.9}
$$

where

$$
\begin{align} \varepsilon_{n}^{y1} &= y_{n} - M_{1}(V_{n-1}, \theta), \quad \varepsilon_{n}^{y2} = y_{n}^{2} - M_{2}(V_{n-1}, \theta), \\ \varepsilon_{n}^{y3} &= y_{n}^{3} - M_{3}(V_{n-1}, \theta), \quad \varepsilon_{n}^{y4} = y_{n}^{4} - M_{4}(V_{n-1}, \theta), \\ \varepsilon_{n}^{v1} &= V_{n} - M_{5}(V_{n-1}, \theta), \quad \varepsilon_{n}^{v2} = V_{n}^{2} - M_{6}(V_{n-1}, \theta), \\ \varepsilon_{n}^{yv} &= y_{n} V_{n} - M_{7}(V_{n-1}, \theta). \tag{3.10} \end{align}
$$

This choice of moment conditions is intuitive and provides some natural and testable conditions on certain lower moments and cross moments of $y$ and $V$ : But these are not the most efficient moment conditions. In order to make them more efficient, we follow Hansen (1985) and introduce the following conditional instruments:

$$
\mathcal{L}_n = \mathcal{D}_n^\top \times \left( \operatorname{Cov}_n^g(\varepsilon_{n+1}) \right)^{-1},
$$

where $\mathrm{Cov}_{n}^{9}(\varepsilon_{n+1})$ denotes the date- $n$ conditional covariance matrix of $\varepsilon_{n+1}$ associated with the parameter W; and ${\mathcal{D}}_{n}$ is the $(7\times n_{\vartheta})$ matrix with ith row $\mathcal{D}_{n}^{i}$ defined by

$$
\begin{align} \mathcal{D}_n^i &= -\frac{\partial M_i(V_n, \vartheta)}{\partial \vartheta} - g_{\vartheta}(c_n, \vartheta)\frac{\partial M_i(v, \vartheta)}{\partial v}\bigg|_{v=V_n}, \quad i=1, 2, 3, 4, \tag{3.11} \\ \mathcal{D}_n^i &= -\frac{\partial M_i(V_n, \vartheta)}{\partial \vartheta} \quad i=5, 6, 7, \end{align}
$$

<!-- Page:12 -->

where $c_{n}$ is the date-$\cdot n$ option-to-spot ratio and $g_{\vartheta}(c_{n},~\vartheta)$ measures the sensitivity of the date-$\cdot n$ option-implied volatility $V_{n}^{\mathfrak{g}}=g(c_{n},{\mathfrak{g}})$ to $\vartheta$: [A formal definition of $g$ is given in Eq. (C.1).] Intuitively, the ‘‘optimal’’ instrument ${\mathcal{X}}_{n}$ has two components: the conditional covariance matrix $\mathrm{Cov}_{n}^{\vartheta}(\varepsilon_{n+1})$ corrects for the conditional heteroskedasticity in the original moment conditions $\varepsilon_{n+1}$; and the Jacobian ${\mathcal{D}}_{n}$ picks up the ‘‘conditional sensitivity’’ of $\varepsilon_{n+1}$ to the model parameters $\vartheta$

The ‘‘optimal’’ moment conditions can, therefore, be calculated by[^14]

$$
\begin{array}{r}{\mathcal{H}_{n+1}=\mathcal{Z}_{n}\varepsilon_{n+1}.\qquad\quad(3.12)}\end{array}
$$

Each element $\mathcal{H}_{n+1}^{j}$ of the ‘‘optimal’’ observations $\mathcal{H}_{n+1}=(\mathcal{H}_{n+1}^{1},...,\mathcal{H}_{n+1}^{n_{3}})$ is associated with an element $\vartheta_{j}$ of the parameter vector $\vartheta$; $\mathcal{H}_{n+1}^{j}$ is a weighted sum of the seven observations $\varepsilon_{n+1}$; normalized by the covariance matrix $\mathrm{Cov}_{n}^{\vartheta}(\varepsilon_{n+1})$; with weights proportional to the date-$n$ ‘‘conditional sensitivity’’ of $\varepsilon_{n+1}$ to $\vartheta_{j}$: Given this set $\mathcal{M}$ of ‘‘optimal’’ observations, we can apply our implied-statevariable approach outlined in Section 6 by replacing the unobserved stochastic volatility $V_{n}$ with the option-implied stochastic volatility $V_{n}^{\vartheta}$

Finally, it should be noted that the efficiency of this ‘‘optimal-instrument’’ scheme is limited in that, in constructing $\mathcal{D}^{5},\mathcal{D}^{6}$; and $\mathcal{D}^{7}$; we sacrifice efficiency by ignoring the dependence of $V^{\vartheta}$ on $\vartheta$: We do, however, gain analytic tractability, because calculations of the form $\mathrm{E}_{n}^{\vartheta}[g_{\vartheta}(c_{n+1},\vartheta)]$; $\operatorname{E}_{n}^{\vartheta}[V_{n+1}g_{\vartheta}(c_{n+1},\vartheta)]$; and $\mathrm{E}_{n}^{\vartheta}[y_{n+1}g_{\vartheta}(c_{n+1},\vartheta)]$ would, indeed, be challenging

## 4. Data

The joint spot and option data are from the Berkeley Options Data Base (BODB), a complete record of trading activity on the floor of the Chicago Board Options Exchange (CBOE)

### 4.1. S&P 500 index and near-the-money short-dated options

We construct a time-series $\{S_{n},~C_{n}\}$ of the S&P 500 index and near-the-money short-dated option prices, from January 1989 to December 1996, with ‘‘weekly’ frequency (every 5 trading days). This joint time-series is plotted in Fig. 1. The details of data collection are as follows

For each observation day, we collect all of the bid–ask quotes (on both calls and puts) that are time-stamped in a pre-determined sampling window. The sampling window, always between 10:00 and $10{:}30\mathrm{a.m.}$, varies from year to year. For example, it is set at $10{:}07{-}10{:}23\mathrm{a.m}$ for all trading days in 1989; and at 10:14– 10:16 a.m. for 1996. We adjust the length of the sampling window to accommodate

---

Relative to full-information approaches, this approach is somewhat inefficient by exploiting only a portion of the distributional information contained in the moment-generating function. See also Singleton (2001) and Liu (1997)

<!-- Page:13 -->

<center><i>Fig. 1. Joint time series of weekly S&P 500 index returns and the near-the-money short-dated option prices.</i></center>

<div align="center">
  <img src="images/e2cc7b7ee8b355932608942d204f4a79e0fc9e72ba5c9380150b5794482623fe.jpg" style="max-width: 70%;" />
</div>


significant changes from year to year in the trading volume of S&P 500 options. We also adjust the start time of the window so that the center of the window is at $10{:}15\mathrm{a.m}$ .

Our objective is to have an adequate pool of options with a spectrum of expirations and strike prices. For the nth observation day, we first sort the options by time to expiration. Among all available options, we select those with a time $\tau_{n}$ to expiration that is larger than 15 calendar days and as close as possible to 30 calendar days.$^{15}$ From the pool of options with the chosen time $\tau_{n}$ to expiration, we then select all options with a strike price $K_{n}$ nearest to the date- $\cdot n$ average of the S&P 500 index. If the remaining pool of options, with the chosen $\tau_{n}$ and $K_{n}$ ; contains multiple calls, we select one of these call options at random. Otherwise, a put option is selected at random.$^{16}$ By repeating this strategy for each date $n$ ; we obtain a time-series $\{C_{n}\}$ of option prices using the average of bid and ask prices. A valuable feature of the CBOE data set is that for each option price $C_{n}$ ; we have a record of the contemporaneous S&P 500 index price $S_{n}$ : The combined time series $\{S_{n},~C_{n}\}$ is, accordingly, synchronized. The sample mean of $\left\{\tau_{n}\right\}$ is 31 days, with a sample

---

$^{15}$ Both time to expiration $\tau_{n}$ and sampling interval  are annualized, using a 365-calendar-day year and a 252-business-day year, respectively. Weatpallpaityet td t ptthat faltat mixture of call and put options employing an additional contract variable. These two approaches are equivalent for our estimation strategy.

<!-- Page:14 -->

<center><i>Fig. 2. Time series of contract variables: time-to-expiration <img src="https://latex.codecogs.com/svg.image?\tau" style="vertical-align: middle; height: 1.2em;" alt="\tau" class="latex-formula"/> and strike-to-spot ratios <img src="https://latex.codecogs.com/svg.image?k" style="vertical-align: middle; height: 1.2em;" alt="k" class="latex-formula"/></i></center>

<div align="center">
  <img src="images/2d71a5ef3ce4816315c5f7c264c0888ceb4bd39e85a3cebca9009ba88bd448b5.jpg" style="max-width: 70%;" />
</div>


standard deviation of 9 days. The sample mean of the strike-to-spot ratio $\{k_{n}=K_{n}/S_{n}\}$ is 1.0002, with a sample standard deviation of 0.0067. The time series $\{T_{n}, k_{n}\}$ is illustrated in Fig. 2.

### 4.2. Time series of in-the-money short-dated calls

On each date $n$ ; we select an in-the-money call $C_{n}^{\mathrm{ITM}}$ with the same maturity as the near-the-money option $C_{n}$ described above, but a different strike price. Among all of the possible ITM call options (with strike price less than that of the near-the-money option $C_{n}$ ), we select the one $C_{n}^{\mathrm{ITM}}$ with strike-to-spot ratio closest to 0.95. If there is no such ITM calls available, we choose an OTM put, again with strike-to-spot ratio closest to 0.95, and then convert the price to that of an ITM call using put/call parity. The sample mean of the strike-to-spot ratio $\{k_{n}^{\mathrm{ITM}}\}$ is 0.952, with a sample standard deviation of 0.007.

### 4.3. Cross-sectional data on calls and puts

We select the 10 most and 10 least volatile days from the weekly sample between January 1989 and December 1996, as measured by the Black–Scholes implied volatility.

---

17From September 11 to October 2, 1992, there is no October contract recorded in the BODB. This results in the ‘‘spike’’ in $\tau$ on the top panel of Fig. 2, because we have to use the November contracts for these observation days. Near the end of 1995, the exchange did not adjust its grid of strike prices to reflect the steady upward movement of the S&P 500 index. During this period, the highest strike price available was well below the spot S&P 500 index. This results in the “dip” in the strike-to-spot ratio on the bottom panel of Fig. 2.

<!-- Page:15 -->

volatility of $\{C_{n}\}$ : For a comparison group of medium-volatility days, we select the ten successive days at weekly intervals between September 20, 1996 and November 22, 1996. The average Black–Scholes implied volatility (BS vol) for the days of high, medium, and low volatilities are $25.1\%$ , $13.6\%$ , and $8.7\%$ , respectively.

On each date $n$ ; we collect all bid and ask quotes of those call and put options that are time-stamped between 10:00 and $11{:}00\mathrm{a.m}$ . For 1996, the time-window is reduced to $10{:}10{-}10{:}20{\mathrm{a.m.}}$ ., due to a surge in trading volume in 1996. Options with fewer than 15 days to expiration are discarded. This set of cross-sectional data is then filtered through the Black–Scholes option-pricing formula to obtain the corresponding BS vol, discarding any observation from which the BS vol cannot be obtained. There is a total of 11,434 observations for the group of high-volatility days, 33,919 observations for the medium-volatility days, and 19,589 observations for the lowvolatility days.

## 5. Empirical results

The estimation results are organized as follows. Section 5.1 focuses on the relative importance of jump- and volatility-risk premia in reconciling the joint time series $\{S_{n},~C_{n}\}$ of spot and option prices. Section 5.2 details a simultaneous estimation of the premia for jump and volatility risks, and evaluates the relative magnitude of these two types of risk premia, using an additional time series $\{C_{n}^{\mathrm{ITM}}\}$ of in-themoney short-dated call options. Section 5.3 extends the analysis to the crosssectional option data, providing further evidence for jump-risk premia. Finally, Section 5.4 examines possible model mis-specifications and their implications on our findings of jump-risk premia. The estimation results associated with the risk-free rates $r$ and dividend yields $q$ ; as well as the results of a Monte-Carlo study, are presented in Appendix E.

### 5.1. Reconciling spot and option dynamics

In order to examine the role of risk premia in reconciling spot and option dynamics, we focus on three nested models of Eqs. (2.1)–(2.5):

\* The SVJ0 model: $\eta^{v}=0$ : $\bullet$ The SV model: $\lambda=0$ : $\bullet$ The SV0 model: $\lambda=0$ and $\eta^{v}=0$ :

These nested models are chosen to represent three different risk-premium structures: jump-risk premia (SVJ0), volatility-risk premia (SV), and no risk premia (SV0).

For all three models, we perform joint estimations of their actual and risk-neutral dynamics using the time series $\{S_{n},~C_{n}\}$ of the S&P 500 index and the near-themoney short-dated option prices. (See data collection details in Section 4.1.) The estimation results are reported in Table 1 and the results of goodness-of-fit tests are summarized in Table 2. The goodness-of-fit tests are constructed directly from the

<!-- Page:16 -->

<center><i>Table 1 IS-GMM estimates of three nested modelsa </i></center>

|      | $\kappa_{v}$ | $\bar{v}$ | $\sigma_{v}$ |  $\rho$ | $\eta^{s}$ | $\eta^{v}$ | $\lambda$ | $\mu$ (%) | $\sigma_{J}$ (%) | $\mu^{*}$ (%) |
| ---- | ------------ | --------: | -----------: | ------: | ---------: | ---------: | --------: | --------: | ---------------: | ------------: |
| SVJ0 | 7.1          |    0.0134 |         0.28 | $-0.52$ |        3.1 |  $\equiv0$ |      27.1 |    $-0.3$ |             3.25 |       $-18.0$ |
|      | (1.9)        |  (0.0029) |       (0.04) |  (0.07) |      (2.9) |            |    (11.8) |     (1.7) |           (0.64) |         (1.6) |
| SV   | 7.1          |    0.0137 |         0.32 | $-0.53$ |        8.6 |        7.6 | $\equiv0$ |         — |                — |             — |
|      | (2.1)        |  (0.0023) |       (0.03) |  (0.06) |      (2.3) |      (2.0) |           |           |                  |               |
| SV0  | 5.3          |    0.0242 |         0.38 | $-0.57$ |        4.4 |  $\equiv0$ | $\equiv0$ |         — |                — |             — |
|      | (1.9)        |  (0.0044) |       (0.04) |  (0.05) |      (1.8) |            |           |           |                  |               |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>a Data: Weekly spot and options data, S&P 500 index, Jan. 1989–Dec. 1996. </i>
</div>
</center>


<center><i>Table 2 Goodness-of-fit tests </i></center>

|                  | $\tilde{\epsilon}$ | SV0          | SV          | SVJ0     |
| ---------------- | ------------------ | ------------ | ----------- | -------- |
| Individual tests | $y1$               | 1.46         | $-0.59$     | 0.27     |
|                  | $y2$               | $-3.98^{**}$ | $-1.56$     | $-0.60$  |
|                  | $y3$               | 0.77         | $-0.29$     | $-0.65$  |
|                  | $y4$               | $-1.45$      | 0.27        | $-0.36$  |
|                  | $v1$               | $-1.91$      | 1.80        | 0.95     |
|                  | $v2$               | $-2.28^{*}$  | 1.24        | 0.59     |
|                  | $yv$               | $2.47^{*}$   | $-0.10$     | 0.60     |
| Joint tests      | All $y$            | $28.2^{**}$  | 8.1         | 1.8      |
|                  | $\chi^2$ (4)       | $(10^{-5})$  | $(0.09)$    | $(0.77)$ |
|                  | All $v$            | $9.1^{*}$    | $11.4^{**}$ | 3.2      |
|                  | $\chi^2$ (2)       | $(0.01)$     | $(0.003)$   | $(0.20)$ |
|                  | All                | $59.9^{**}$  | $31.6^{**}$ | 7.6      |
|                  | $\chi^2$ (7)       | $(10^{-10})$ | $(10^{-5})$ | $(0.37)$ |

<center>
<div style="display: inline-block; text-align: left; max-width: 80%;">
<i>n Indicate significance under a <img src="https://latex.codecogs.com/svg.image?5\%" style="vertical-align: middle; height: 1.2em;" alt="5\%" class="latex-formula"/> test. nn Indicate significance under a 1% test. For individual tests, only the test statistics (standard normal in large sample) are reported. The <img src="https://latex.codecogs.com/svg.image?p" style="vertical-align: middle; height: 1.2em;" alt="p" class="latex-formula"/> -values for the <img src="https://latex.codecogs.com/svg.image?\chi^{2}" style="vertical-align: middle; height: 1.2em;" alt="\chi^{2}" class="latex-formula"/> joint tests are reported in parentheses. </i>
</div>
</center>


heteroskedasticity-corrected version of $\varepsilon$, defined by 

$$
\tilde{\varepsilon}_n^i = \frac{\varepsilon_n^i}{\sqrt{\mathbf{E}_{(n-1)}\left(\varepsilon_n^i\right)^2}}, \quad i \in \{1, \ldots, 7\}.
$$

We test the seven moment conditions, $\operatorname{E}_{n-1}(\tilde{\varepsilon}_{n})=0$; both individually and jointly.$^{18}$

As summarized in Table 2, both the SV0 and SV models are strongly rejected by the joint time-series data (with $p$-values of $10^{-10}$ and $10^{-5}$, respectively), while the SVJ0 model is not rejected (associated $p$-value $=0.37$).

To gain some insights to this