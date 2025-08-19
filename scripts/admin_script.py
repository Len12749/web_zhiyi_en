#!/usr/bin/env python3
"""
智译平台积分系统管理脚本
交互式界面，用户友好的积分管理工具
适配 Casdoor 身份认证系统

使用前请确保安装依赖：
pip install psycopg2-binary
"""

import psycopg2
import psycopg2.extras
import sys
import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# 数据库连接配置
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres")

def get_db_connection():
    """获取数据库连接"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        return conn
    except psycopg2.Error as e:
        print(f"❌ 数据库连接失败: {e}")
        return None

def generate_redeem_code(length=8):
    """生成随机兑换码"""
    characters = string.ascii_uppercase + string.digits
    # 排除容易混淆的字符
    characters = characters.replace('0', '').replace('O', '').replace('I', '').replace('1', '')
    return ''.join(random.choices(characters, k=length))

def get_user_input(prompt, default=None, input_type=str, validator=None):
    """获取用户输入，支持默认值和验证"""
    while True:
        try:
            if default is not None:
                user_input = input(f"{prompt} [默认: {default}]: ").strip()
                if not user_input:
                    user_input = str(default)
            else:
                user_input = input(f"{prompt}: ").strip()
            
            if not user_input and default is None:
                print("❌ 输入不能为空，请重试")
                continue
            
            # 类型转换
            if input_type == int:
                user_input = int(user_input)
            elif input_type == bool:
                user_input = user_input.lower() in ['true', 'yes', 'y', '1', '是']
            
            # 自定义验证
            if validator and not validator(user_input):
                print("❌ 输入格式不正确，请重试")
                continue
            
            return user_input
        except ValueError:
            print(f"❌ 请输入有效的{input_type.__name__}，请重试")
        except KeyboardInterrupt:
            print("\n👋 操作已取消")
            return None

def confirm_action(message):
    """确认操作"""
    response = input(f"{message} (y/N): ").strip().lower()
    return response in ['y', 'yes', '是']

class PointsManager:
    def __init__(self):
        self.conn = get_db_connection()
        if not self.conn:
            print("❌ 无法连接到数据库，程序退出")
            sys.exit(1)
        
        self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def __del__(self):
        """清理数据库连接"""
        if hasattr(self, 'cursor') and self.cursor:
            self.cursor.close()
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()

    def show_main_menu(self):
        """显示主菜单"""
        print("\n" + "="*50)
        print("🛠️  智译平台积分系统管理工具")
        print("="*50)
        print("1. 💳 兑换码管理")
        print("2. 👤 用户积分管理") 
        print("3. 🌟 无限积分设置")
        print("0. 🚪 退出程序")
        print("="*50)

    def show_redeem_menu(self):
        """显示兑换码管理菜单"""
        print("\n" + "-"*40)
        print("💳 兑换码管理")
        print("-"*40)
        print("1. 创建新兑换码")
        print("2. 查看兑换码列表")
        print("3. 激活/停用兑换码")
        print("4. 删除兑换码")
        print("0. 返回主菜单")
        print("-"*40)

    def show_user_menu(self):
        """显示用户管理菜单"""
        print("\n" + "-"*40)
        print("👤 用户积分管理")
        print("-"*40)
        print("1. 查看用户列表")
        print("2. 查看用户详情")
        print("3. 修改用户积分")
        print("0. 返回主菜单")
        print("-"*40)

    def create_redeem_code_interactive(self):
        """交互式创建兑换码"""
        print("\n📝 创建新兑换码")
        print("-"*30)
        
        points_value = get_user_input("积分价值", input_type=int, validator=lambda x: x > 0)
        if points_value is None:
            return
        
        custom_code = get_user_input("自定义兑换码 (留空自动生成)", default="")
        if custom_code == "":
            custom_code = None
        
        print(f"\n📋 即将创建兑换码:")
        print(f"   积分价值: {points_value}")
        print(f"   使用次数: 1次")
        print(f"   有效期: 永不过期")
        print(f"   兑换码: {custom_code if custom_code else '自动生成'}")
        
        if confirm_action("确认创建"):
            self.create_redeem_code(points_value, 1, None, custom_code)

    def create_redeem_code(self, points_value: int, max_uses: Optional[int] = 1, 
                          expires_days: Optional[int] = None, custom_code: Optional[str] = None) -> bool:
        """创建兑换码"""
        try:
            code = custom_code or generate_redeem_code()
            expires_at = None
            
            if expires_days:
                expires_at = datetime.now() + timedelta(days=expires_days)

            # 检查兑换码是否已存在
            self.cursor.execute("SELECT id FROM redeem_codes WHERE code = %s", (code,))
            if self.cursor.fetchone():
                print(f"❌ 兑换码 '{code}' 已存在")
                return False

            self.cursor.execute("""
                INSERT INTO redeem_codes (code, points_value, max_uses, current_uses, is_active, expires_at)
                VALUES (%s, %s, %s, 0, true, %s)
            """, (code, points_value, max_uses, expires_at))

            print(f"\n✅ 兑换码创建成功!")
            print(f"   🎫 代码: {code}")
            print(f"   💰 价值: {points_value} 积分")
            print(f"   🔢 使用次数: 1次")
            print(f"   ⏰ 有效期: 永不过期")
            print(f"   📝 说明: 此兑换码只能使用一次，不会过期")
            return True

        except psycopg2.Error as e:
            print(f"❌ 创建兑换码失败: {e}")
            return False

    def list_redeem_codes_interactive(self):
        """交互式查看兑换码列表"""
        show_all = get_user_input("是否包含已停用的兑换码", default="n", input_type=bool)
        if show_all is None:
            return
        
        self.list_redeem_codes(show_inactive=show_all)

    def list_redeem_codes(self, show_inactive=False):
        """列出兑换码"""
        try:
            query = """
                SELECT id, code, points_value, max_uses, current_uses, is_active, 
                       expires_at, created_at
                FROM redeem_codes
            """
            
            if not show_inactive:
                query += " WHERE is_active = true"
            
            query += " ORDER BY created_at DESC"
            
            self.cursor.execute(query)
            codes = self.cursor.fetchall()

            if not codes:
                print("📝 暂无兑换码")
                return

            print(f"\n📋 兑换码列表 ({'包含已停用' if show_inactive else '仅显示活跃'}):")
            print("-" * 100)
            print(f"{'ID':<4} {'代码':<12} {'积分值':<8} {'已用/总数':<12} {'状态':<8} {'创建时间':<20} {'过期时间'}")
            print("-" * 100)

            for code in codes:
                status = "🟢 活跃" if code['is_active'] else "🔴 停用"
                max_uses_str = str(code['max_uses']) if code['max_uses'] else "无限"
                usage_str = f"{code['current_uses']}/{max_uses_str}"
                expires_str = code['expires_at'].strftime('%Y-%m-%d') if code['expires_at'] else "永不过期"
                created_str = code['created_at'].strftime('%Y-%m-%d %H:%M')

                print(f"{code['id']:<4} {code['code']:<12} {code['points_value']:<8} {usage_str:<12} {status:<8} {created_str:<20} {expires_str}")

        except psycopg2.Error as e:
            print(f"❌ 获取兑换码列表失败: {e}")

    def toggle_redeem_code_interactive(self):
        """交互式激活/停用兑换码"""
        self.list_redeem_codes(show_inactive=True)
        
        code_id = get_user_input("请输入要操作的兑换码ID", input_type=int, validator=lambda x: x > 0)
        if code_id is None:
            return
        
        if confirm_action("确认切换此兑换码的状态"):
            self.toggle_redeem_code(code_id)

    def toggle_redeem_code(self, code_id: int):
        """激活/停用兑换码"""
        try:
            # 获取当前状态
            self.cursor.execute("SELECT code, is_active FROM redeem_codes WHERE id = %s", (code_id,))
            result = self.cursor.fetchone()
            
            if not result:
                print(f"❌ 找不到ID为 {code_id} 的兑换码")
                return False

            new_status = not result['is_active']
            self.cursor.execute(
                "UPDATE redeem_codes SET is_active = %s WHERE id = %s",
                (new_status, code_id)
            )

            status_text = "激活" if new_status else "停用"
            print(f"✅ 兑换码 '{result['code']}' 已{status_text}")
            return True

        except psycopg2.Error as e:
            print(f"❌ 更新兑换码状态失败: {e}")
            return False

    def delete_redeem_code_interactive(self):
        """交互式删除兑换码"""
        self.list_redeem_codes(show_inactive=True)
        
        code_id = get_user_input("请输入要删除的兑换码ID", input_type=int, validator=lambda x: x > 0)
        if code_id is None:
            return
        
        if confirm_action("⚠️ 确认删除此兑换码 (此操作不可撤销)"):
            self.delete_redeem_code(code_id)

    def delete_redeem_code(self, code_id: int):
        """删除兑换码"""
        try:
            # 获取兑换码信息
            self.cursor.execute("SELECT code FROM redeem_codes WHERE id = %s", (code_id,))
            result = self.cursor.fetchone()
            
            if not result:
                print(f"❌ 找不到ID为 {code_id} 的兑换码")
                return False

            # 删除兑换码（关联的兑换记录会因为外键约束被级联删除）
            self.cursor.execute("DELETE FROM redeem_codes WHERE id = %s", (code_id,))
            
            print(f"✅ 兑换码 '{result['code']}' 已删除")
            return True

        except psycopg2.Error as e:
            print(f"❌ 删除兑换码失败: {e}")
            return False

    def find_user(self, identifier: str) -> Optional[Dict[str, Any]]:
        """查找用户 (通过用户ID)"""
        try:
            self.cursor.execute("""
                SELECT id, user_id, points, has_infinite_points, membership_type, 
                       membership_expiry, created_at, updated_at
                FROM users WHERE user_id = %s
            """, (identifier,))
            return self.cursor.fetchone()
        except psycopg2.Error as e:
            print(f"❌ 查找用户失败: {e}")
            return None

    def list_users_interactive(self):
        """交互式列出用户"""
        limit = get_user_input("显示用户数量", default=20, input_type=int, validator=lambda x: x > 0)
        if limit is None:
            return
        
        self.list_users(limit)

    def list_users(self, limit: int = 20):
        """列出用户"""
        try:
            self.cursor.execute("""
                SELECT id, user_id, points, has_infinite_points, membership_type, 
                       membership_expiry, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT %s
            """, (limit,))
            
            users = self.cursor.fetchall()
            
            if not users:
                print("📝 暂无用户")
                return

            print(f"\n👥 用户列表 (最近 {limit} 个):")
            print("-" * 120)
            print(f"{'ID':<6} {'用户ID':<28} {'积分':<8} {'无限积分':<10} {'会员类型':<10} {'会员到期':<12} {'注册时间'}")
            print("-" * 120)

            for user in users:
                infinite_icon = "🌟 是" if user['has_infinite_points'] else "❌ 否"
                created_str = user['created_at'].strftime('%Y-%m-%d %H:%M')
                membership_type = user['membership_type'] or "免费版"
                expiry_str = user['membership_expiry'].strftime('%Y-%m-%d') if user['membership_expiry'] else "无限期"
                
                print(f"{user['id']:<6} {user['user_id']:<28} {user['points']:<8} {infinite_icon:<10} {membership_type:<10} {expiry_str:<12} {created_str}")

        except psycopg2.Error as e:
            print(f"❌ 获取用户列表失败: {e}")

    def get_user_details_interactive(self):
        """交互式查看用户详情"""
        user_identifier = get_user_input("请输入用户ID")
        if user_identifier is None:
            return
        
        self.get_user_details(user_identifier)

    def get_user_details(self, user_identifier: str):
        """获取用户详细信息"""
        try:
            user = self.find_user(user_identifier)
            if not user:
                print(f"❌ 找不到用户: {user_identifier}")
                return

            user_id = user['user_id']

            # 获取积分交易历史
            self.cursor.execute("""
                SELECT amount, transaction_type, description, created_at
                FROM point_transactions
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 10
            """, (user_id,))
            
            transactions = self.cursor.fetchall()

            # 获取签到记录
            self.cursor.execute("""
                SELECT checkin_date, points_earned
                FROM user_checkins
                WHERE user_id = %s
                ORDER BY checkin_date DESC
                LIMIT 5
            """, (user_id,))
            
            checkins = self.cursor.fetchall()

            # 显示用户信息
            print(f"\n👤 用户详细信息:")
            print(f"   🆔 用户ID: {user['user_id']}")
            print(f"   💰 当前积分: {user['points']}")
            print(f"   🌟 无限积分: {'是' if user['has_infinite_points'] else '否'}")
            print(f"   🔰 会员类型: {user['membership_type'] or '免费版'}")
            print(f"   ⏰ 会员到期: {user['membership_expiry'].strftime('%Y-%m-%d') if user['membership_expiry'] else '无限期'}")
            print(f"   📅 注册时间: {user['created_at'].strftime('%Y-%m-%d %H:%M:%S')}")

            print(f"\n💰 最近积分交易:")
            if transactions:
                for tx in transactions:
                    sign = "+" if tx['amount'] > 0 else ""
                    created_str = tx['created_at'].strftime('%Y-%m-%d %H:%M')
                    print(f"   {created_str} {sign}{tx['amount']} - {tx['description']} ({tx['transaction_type']})")
            else:
                print("   暂无交易记录")

            print(f"\n📅 最近签到记录:")
            if checkins:
                for checkin in checkins:
                    checkin_str = checkin['checkin_date'].strftime('%Y-%m-%d')
                    print(f"   {checkin_str} +{checkin['points_earned']} 积分")
            else:
                print("   暂无签到记录")

        except psycopg2.Error as e:
            print(f"❌ 获取用户详情失败: {e}")

    def modify_user_points_interactive(self):
        """交互式修改用户积分"""
        print("\n💰 修改用户积分")
        print("-"*30)
        
        user_identifier = get_user_input("请输入用户ID")
        if user_identifier is None:
            return
        
        # 先显示用户信息
        user = self.find_user(user_identifier)
        if not user:
            print(f"❌ 找不到用户: {user_identifier}")
            return
        
        print(f"\n👤 找到用户: {user['user_id']}")
        print(f"   当前积分: {user['points']}")
        print(f"   无限积分: {'是' if user['has_infinite_points'] else '否'}")
        print(f"   会员类型: {user['membership_type'] or '免费版'}")
        
        points_change = get_user_input("积分变化量 (正数增加，负数扣除)", input_type=int)
        if points_change is None:
            return
        
        description = get_user_input("操作描述", default="管理员调整")
        if description is None:
            return
        
        action = "增加" if points_change > 0 else "扣除"
        new_points = user['points'] + points_change
        
        print(f"\n📋 即将执行操作:")
        print(f"   用户ID: {user['user_id']}")
        print(f"   当前积分: {user['points']}")
        print(f"   {action}积分: {abs(points_change)}")
        print(f"   操作后积分: {new_points}")
        print(f"   操作描述: {description}")
        
        if confirm_action("确认执行此操作"):
            self.modify_user_points(user_identifier, points_change, description)

    def modify_user_points(self, user_identifier: str, points_change: int, description: str = "管理员调整") -> bool:
        """修改用户积分"""
        try:
            user = self.find_user(user_identifier)
            if not user:
                print(f"❌ 找不到用户: {user_identifier}")
                return False

            user_id = user['user_id']
            current_points = user['points']
            new_points = current_points + points_change

            if new_points < 0 and not user['has_infinite_points']:
                print(f"❌ 积分不足，当前积分: {current_points}，尝试扣除: {abs(points_change)}")
                return False

            # 更新用户积分
            self.cursor.execute("""
                UPDATE users 
                SET points = %s, updated_at = NOW()
                WHERE user_id = %s
            """, (new_points, user_id))

            # 记录积分交易
            transaction_type = "ADMIN_EARN" if points_change > 0 else "ADMIN_CONSUME"
            self.cursor.execute("""
                INSERT INTO point_transactions (user_id, amount, transaction_type, description)
                VALUES (%s, %s, %s, %s)
            """, (user_id, points_change, transaction_type, description))

            action = "增加" if points_change > 0 else "扣除"
            print(f"\n✅ 积分操作成功!")
            print(f"   用户ID: {user_id}")
            print(f"   {action}积分: {abs(points_change)}")
            print(f"   原积分: {current_points}")
            print(f"   新积分: {new_points}")
            return True

        except psycopg2.Error as e:
            print(f"❌ 修改用户积分失败: {e}")
            return False

    def set_infinite_points_interactive(self):
        """交互式设置无限积分"""
        print("\n🌟 设置/取消无限积分权限")
        print("-"*30)
        
        user_identifier = get_user_input("请输入用户ID")
        if user_identifier is None:
            return
        
        # 先显示用户信息
        user = self.find_user(user_identifier)
        if not user:
            print(f"❌ 找不到用户: {user_identifier}")
            return
        
        print(f"\n👤 找到用户: {user['user_id']}")
        print(f"   当前积分: {user['points']}")
        print(f"   会员类型: {user['membership_type'] or '免费版'}")
        print(f"   当前无限积分状态: {'已开启' if user['has_infinite_points'] else '未开启'}")
        
        if user['has_infinite_points']:
            action = "取消"
            new_status = False
        else:
            action = "设置"
            new_status = True
        
        if confirm_action(f"确认为此用户{action}无限积分权限"):
            self.set_infinite_points(user_identifier, new_status)

    def set_infinite_points(self, user_identifier: str, infinite: bool) -> bool:
        """设置/取消用户无限积分"""
        try:
            user = self.find_user(user_identifier)
            if not user:
                print(f"❌ 找不到用户: {user_identifier}")
                return False

            user_id = user['user_id']

            # 更新无限积分状态
            self.cursor.execute("""
                UPDATE users 
                SET has_infinite_points = %s, updated_at = NOW()
                WHERE user_id = %s
            """, (infinite, user_id))

            # 记录操作日志
            description = "管理员设置无限积分" if infinite else "管理员取消无限积分"
            self.cursor.execute("""
                INSERT INTO point_transactions (user_id, amount, transaction_type, description)
                VALUES (%s, 0, 'ADMIN_CONFIG', %s)
            """, (user_id, description))

            action = "设置" if infinite else "取消"
            print(f"\n✅ 无限积分权限操作成功!")
            print(f"   用户ID: {user_id}")
            print(f"   操作: {action}无限积分权限")
            return True

        except psycopg2.Error as e:
            print(f"❌ 设置无限积分失败: {e}")
            return False



    def run(self):
        """运行主程序"""
        print("🚀 正在连接数据库...")
        
        try:
            while True:
                self.show_main_menu()
                choice = get_user_input("请选择操作", validator=lambda x: x in ['0', '1', '2', '3'])
                
                if choice is None or choice == '0':
                    print("👋 再见!")
                    break
                
                elif choice == '1':  # 兑换码管理
                    while True:
                        self.show_redeem_menu()
                        sub_choice = get_user_input("请选择操作", validator=lambda x: x in ['0', '1', '2', '3', '4'])
                        
                        if sub_choice is None or sub_choice == '0':
                            break
                        elif sub_choice == '1':
                            self.create_redeem_code_interactive()
                        elif sub_choice == '2':
                            self.list_redeem_codes_interactive()
                        elif sub_choice == '3':
                            self.toggle_redeem_code_interactive()
                        elif sub_choice == '4':
                            self.delete_redeem_code_interactive()
                
                elif choice == '2':  # 用户积分管理
                    while True:
                        self.show_user_menu()
                        sub_choice = get_user_input("请选择操作", validator=lambda x: x in ['0', '1', '2', '3'])
                        
                        if sub_choice is None or sub_choice == '0':
                            break
                        elif sub_choice == '1':
                            self.list_users_interactive()
                        elif sub_choice == '2':
                            self.get_user_details_interactive()
                        elif sub_choice == '3':
                            self.modify_user_points_interactive()
                
                elif choice == '3':  # 无限积分设置
                    self.set_infinite_points_interactive()
                
                input("\n按回车键继续...")
                
        except KeyboardInterrupt:
            print("\n\n👋 程序已退出")

def main():
    """主函数"""
    print("""
🛠️  智译平台积分系统管理工具
=====================================
本工具提供交互式界面管理积分系统
适配 Casdoor 身份认证系统

功能包括:
• 💳 兑换码管理 (创建/查看/激活/删除)
• 👤 用户积分管理 (查看/修改积分)
• 🌟 无限积分权限设置
• 🔰 会员管理 (查看会员状态)

环境变量:
• DATABASE_URL: 数据库连接字符串 (默认: postgresql://postgres:postgres@127.0.0.1:54322/postgres)

请确保已安装依赖: pip install psycopg2-binary
=====================================
""")
    
    try:
        manager = PointsManager()
        manager.run()
    except Exception as e:
        print(f"❌ 程序出现错误: {e}")

if __name__ == "__main__":
    main() 