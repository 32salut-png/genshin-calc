import os
import random
from requests_oauthlib import OAuth1Session

# GitHub Secretsからキーを取得
API_KEY = os.environ["X_API_KEY"]
API_SECRET = os.environ["X_API_SECRET"]
ACCESS_TOKEN = os.environ["X_ACCESS_TOKEN"]
ACCESS_SECRET = os.environ["X_ACCESS_SECRET"]

# ツールのURL
URL = "https://32salut-png.github.io/genshin-calc/"

# 5パターンをセット（実行されるたびにこの中から1つがランダムで選ばれます）
TWEETS = [
    f"🎯【週末の原神 原石チェック】\n\n次のガチャまでに目標のキャラや武器は引けそう？\nバージョンごとの配布原石を自動計算して、10万回の確率試行で「成功率」を精密シミュレート！\n\nガチャ前の計画や運試しにどうぞ📊\n\n🔗 {URL}\n#原神 #GenshinImpact #原神計算機",
    f"🚀【新ガチャ開幕間近！】\n\n「手持ちの原石でキャラ凸＋モチ武器まで狙える？」\n日付指定で貯まる原石を算出し、あなたに合った最適なガチャ計画をグラフで提示します！\n\n画面も固まらずサクサク動きます✨\n\n🔗 {URL}\n#原神 #GenshinImpact #原神計算機",
    f"💡「次のアプデまでに原石って実際何個貯まるの？」\n\nイベントや配布分を全自動で集計してくれる原神専用シミュレーター！\n実際のガチャ確率に基づいた10万回の試行データで、すり抜けのリスクも可視化します🎯\n\nガチャ計画のお供にぜひ！\n\n🔗 {URL}\n#原神 #GenshinImpact",
    f"⚡【重い計算中も固まらない！原神ガチャ計算機】\n\n10万回のモンテカルロ試行を爆速で処理！\n狙いたい凸数と手持ちの原石を入れるだけで「目標達成率」がすぐに分かります。\n\n無料・登録不要で使えます👍\n\n🔗 {URL}\n#原神 #GenshinImpact #原神計算機",
    f"⚔️【キャラ凸＆モチーフ武器の両狙い勢へ】\n\nキャラと武器、どちらも確保できる確率を精密分析して、一番勝率の高い引き方をアドバイスします！\n\nガチャを回す前の最終チェックに📊\n\n🔗 {URL}\n#原神 #GenshinImpact",
]


def post_tweet():
    # ランダムで投稿文章を選択
    text = random.choice(TWEETS)
    
    # OAuth1.0a 認証
    twitter = OAuth1Session(API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET)
    
    # ツイート投稿API (v2)
    payload = {"text": text}
    response = twitter.post("https://api.twitter.com/2/tweets", json=payload)
    
    if response.status_code == 201:
        print("ツイート投稿成功！")
    else:
        print(f"エラーが発生しました: {response.status_code} - {response.text}")

if __name__ == "__main__":
    post_tweet()
