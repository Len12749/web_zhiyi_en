"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  MapPin, 
  Globe, 
  Lightbulb, 
  ArrowLeft,
  Building,
  Trophy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/lib/hooks/use-scroll-animation';

const teamMembers = [
  {
    name: '北京理工大学',
    description: '北京理工大学是中国共产党创办的第一所理工科大学，是国家"双一流"建设高校，首批进入国家"211工程"和"985工程"建设行列。学校在兵器科学与技术、车辆工程、信息与通信工程、控制科学与工程等学科领域具有显著优势，被誉为"国防七子"之一，在国防科技、车辆工程、人工智能等领域享有盛誉。',
    icon: Building,
    color: 'from-red-500 to-orange-500'
  },
  {
    name: '大连理工大学',
    description: '大连理工大学是教育部直属全国重点大学，是国家"双一流"建设高校，首批进入国家"211工程"和"985工程"建设行列。学校在工程力学、化学工程与技术、船舶与海洋工程、土木工程等学科领域具有深厚底蕴，被誉为"四大工学院"之一，在工程教育、海洋工程、化工等领域享有很高声誉。',
    icon: Building,
    color: 'from-blue-500 to-cyan-500'
  }
];

const academicJournals = [
  {
    name: '《科学学研究》',
    description: '《科学学研究》是中国科学院科技战略咨询研究院主办的综合性学术期刊，是CSSCI来源期刊。团队成员以第一作者身份在该期刊发表重要研究成果，该期刊主要刊载科学学理论、科技政策、科技管理、科技史等方面的研究成果，在科学学领域具有重要影响力。',
    type: 'CSSCI',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: '《Frontiers of Physics》',
    description: '《Frontiers of Physics》是由高等教育出版社和Springer联合出版的英文学术期刊，是SCI收录期刊。该期刊主要发表物理学各领域的前沿研究成果，在物理学界享有很高声誉。',
    type: 'SCI',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500'
  }
];

const expertiseAreas = [
  {
    title: '经济学',
    description: '团队成员具备扎实的经济学理论基础，熟悉宏观经济分析、微观经济理论、计量经济学等核心领域。',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    title: '数学',
    description: '拥有深厚的数学功底，涵盖高等数学、线性代数、概率统计、数值分析等数学分支。',
    icon: Lightbulb,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: '计算机',
    description: '具备丰富的计算机科学知识，包括算法设计、数据结构、软件工程、人工智能等前沿技术。',
    icon: Lightbulb,
    color: 'from-green-500 to-teal-500'
  },
  {
    title: '物理学',
    description: '拥有扎实的工程力学基础，涵盖结构力学、材料力学、流体力学、振动理论等工程应用领域。',
    icon: Lightbulb,
    color: 'from-purple-500 to-violet-500'
  }
];

export default function AboutPage() {
  // 为每个section创建滚动动画hook
  const headerAnimation = useScrollAnimation();
  const teamAnimation = useScrollAnimation();
  const universityAnimation = useScrollAnimation();
  const aiAnimation = useScrollAnimation();
  const academicAnimation = useScrollAnimation();
  const missionAnimation = useScrollAnimation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section ref={headerAnimation.ref} className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                关于我们
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              汇聚各领域精英，致力于为您提供最优质的AI文档处理服务
            </p>
            
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  北京理工智译科技有限公司
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  返回首页
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Overview */}
      <section ref={teamAnimation.ref} className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={teamAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">团队概览</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">专业、多元、创新的技术团队</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expertiseAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={teamAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: teamAnimation.isVisible ? 0.1 * index : 0 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-2xl dark:hover:shadow-slate-700/20 h-full">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${area.color} flex items-center justify-center mb-4 shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {area.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* University Background */}
      <section ref={universityAnimation.ref} className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={universityAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">教育背景</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">来自国内知名高校的优秀人才</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={universityAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: universityAnimation.isVisible ? 0.1 * index : 0 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-2xl dark:hover:shadow-slate-700/20 h-full">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${member.color} flex items-center justify-center mb-6 shadow-md`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {member.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Expertise */}
      <section ref={aiAnimation.ref} className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={aiAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">AI技术专家</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">深度学习与自然语言处理领域的技术专家</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={aiAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: aiAnimation.isVisible ? 0.2 : 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-xl border border-purple-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">英瑞</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                        工程力学专业
                      </span>
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                        大模型微调专家
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                        深度学习工程师
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    2021年起于Coursera学习深度神经网络，后在国际化拔尖创新人才培养计划中与Björn Schuller教授继续学习人工智能，同时学习大模型全栈工程师，并选择大模型微调方向深入，结合工程化思想，在实践中积累数据清洗、预处理和微调相关的经验和直觉。
                  </p>
                  <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center mr-6">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>国际化拔尖创新人才培养计划</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Coursera深度学习</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academic Achievements */}
      <section ref={academicAnimation.ref} className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={academicAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">学术成果</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">在权威期刊发表重要研究成果</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {academicJournals.map((journal, index) => {
              const Icon = journal.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={academicAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: academicAnimation.isVisible ? 0.1 * index : 0 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-2xl dark:hover:shadow-slate-700/20 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${journal.color} flex items-center justify-center shadow-md`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        journal.type === 'CSSCI' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {journal.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      {journal.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {journal.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section ref={missionAnimation.ref} className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={missionAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">我们的使命</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">致力于提供最先进的AI文档处理服务</p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={missionAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: missionAnimation.isVisible ? 0.2 : 0 }}
                className="pt-8"
              >
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  凭借深厚的学术背景和丰富的技术经验，我们致力于为用户提供最先进、最可靠的AI文档处理服务。通过持续的技术创新和服务优化，让文档处理变得更加智能、高效、便捷。
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}