// Editorial adaptation of verified design documents. Provenance lives in the Term Review audit workspace.
export const supportingReadableSections = {
  "/monologue": [
    {
      "kind": "copy-grid",
      "title": "Premise and Narrative Structure",
      "left": {
        "title": "The Premise",
        "en": "To Be Chosen is a narrative-driven survival horror game set around a cheerleading team stranded in a fog-covered mountain village. The village appears to offer shelter, but the team gradually finds signs of a ritual that has happened before.",
        "zh": "《To Be Chosen》是一款以生存恐怖為核心的敘事遊戲。啦啦隊在一座被濃霧包圍的山村受困，村莊看似提供庇護，隊員卻逐漸發現這裡曾經反覆進行某種儀式。"
      },
      "right": {
        "title": "The Perspective System",
        "en": "The design uses an asymmetrical, episodic perspective structure. Each character sees only part of the situation, while the player connects the fragments across the squad. The story is proposed as a sequence of limited viewpoints rather than one uninterrupted account.",
        "zh": "設計採用非對稱、分段式的多視角結構。每個角色只能看見事件的一部分，玩家則要把整個隊伍的片段連在一起。故事被設計成一連串受限的視角，而不是一段不中斷的單一路線。"
      }
    },
    {
      "kind": "text",
      "title": "Scene Proposal / After the Bus Accident",
      "paragraphs": [
        {
          "en": "The first proposed perspective split happens after the bus accident. Sarah investigates the missing driver and the accident while Alexis stays with the girls and manages the tension on the bus. The two strands move at the same time. Sarah’s investigation brings the village into view and exposes her actions to the elders, while the girls wait without knowing what has happened to her.",
          "zh": "第一個多視角提案發生在巴士事故之後。Sarah 調查失蹤的司機與事故，Alexis 則留在車上處理隊伍裡的緊張關係。兩條線同時推進：Sarah 的調查帶出村莊，也讓長老注意到她的行動；留在車上的隊員則不知道她遇到了什麼。"
        },
        {
          "en": "This example shows why the perspective shift exists. The player does not receive the whole situation from above; they learn what each group can observe, then compare the gaps when the story moves to another character. This is a design example from the narrative document, not a verified playable recording.",
          "zh": "這個例子說明視角切換為什麼存在。玩家不會從全知角度直接得到完整情況，而是先知道每一組角色能觀察到什麼，再在切換到另一個角色時比較資訊缺口。這是敘事文件中的設計例子，還不是已核對的可玩錄影。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Narrative Methods",
      "items": [
        [
          "MULTI-POV",
          "Shift the player’s limited viewpoint as the plot moves between characters.",
          "隨著劇情轉移到不同角色，切換玩家受限的視角。"
        ],
        [
          "ENVIRONMENT",
          "Use spaces, marks, calendars, and room patterns to suggest how the village operates.",
          "用空間、符號、日曆與房間的模式提示村莊如何運作。"
        ],
        [
          "RELICS",
          "Let diaries, ledgers, and victim records expose a pattern that dialogue has not explained.",
          "讓日記、名冊與受害者留下的記錄揭露對話沒有說明的模式。"
        ],
        [
          "MICRO-CUTSCENES",
          "Use short, contextual reveals to increase pressure without removing the character’s point of view.",
          "用短而有情境的揭示增加壓力，同時保留角色自身的視角。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "What the Environment Reveals",
      "paragraphs": [
        {
          "en": "The village is meant to feel cold, organised, and hostile rather than randomly frightening. In the inn example, half-finished teacups and a calendar with every month crossed out except tonight suggest that the disappearances follow a pattern. In the basement example, narrowing corridors and restraint devices change the space from a place of shelter into a place built for captives.",
          "zh": "村莊被設計成冷漠、有秩序而且具有敵意的地方，而不是隨機製造驚嚇。在旅店例子裡，喝到一半的茶杯和只留下今晚空白的日曆，暗示失蹤事件有固定模式；在地下室例子裡，逐漸變窄的走廊與拘束裝置，讓空間從庇護所變成為囚禁而建的地方。"
        },
        {
          "en": "The player is expected to read these details as evidence. The document describes a shift from reacting to a strange place to recognising the rules behind it. That shift is a design intention; the material does not include a measured player test for it.",
          "zh": "玩家被期待把這些細節當成證據來閱讀。文件描述的變化，是從對陌生場所做出反應，逐漸轉向辨認它背後的規則。這是設計意圖，現有材料沒有提供量化的玩家測試。"
        }
      ]
    },
    {
      "kind": "flow",
      "title": "Fragment → Connection",
      "steps": [
        [
          "PERSPECTIVE",
          "Follow one character’s limited view.",
          "跟隨一個角色受限的視角。"
        ],
        [
          "DISCOVERY",
          "Inspect a space, object, or record.",
          "調查空間、物件或記錄。"
        ],
        [
          "COMPARISON",
          "Re-evaluate earlier clues against another fragment.",
          "把另一個片段拿來重新理解先前的線索。"
        ],
        [
          "TRANSITION",
          "Move to another viewpoint with a different part of the situation.",
          "轉移到看見另一部分情況的角色視角。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Evidence Boundary",
      "paragraphs": [
        {
          "en": "The documents establish the narrative premise, the perspective examples, and the intended relationship between clues and player understanding. They do not include a complete matched recording of one scene. The next useful evidence is one continuous sequence from entering a scene, investigating an object, changing point of view, and showing what new information the player receives.",
          "zh": "現有文件能證明敘事前提、視角例子，以及線索與玩家理解之間的設計關係，但沒有一段完整且對應版本的場景錄影。下一份有用的證據，是從進入場景、調查物件、切換視角到展示玩家取得的新資訊的一段連續流程。"
        }
      ]
    }
  ],
  "/alt-controller-2025-b": [
    {
      "kind": "copy-grid",
      "title": "Prepare. Slice. Serve.",
      "left": {
        "title": "The Sequence",
        "en": "SushiGo organises the kitchen around one physical sequence: pick up the knife, cut the salmon, pick up the slice, combine it with rice, place the sushi on a plate, and send the plate into the serve zone.",
        "zh": "SushiGo 把廚房整理成一段身體操作流程：拿起刀、切三文魚、拿起魚片、把魚片和米飯合併、將壽司放到盤子上，再把盤子送進出餐區。"
      },
      "right": {
        "title": "Gesture Design",
        "en": "The Figma source separates grip, wrist rotation, and pinch as gesture concerns. In the implemented tutorial, full-hand grasp handles the food objects while gaze and pinch are used for menu controls.",
        "zh": "Figma 原稿把抓取、手腕旋轉與捏取分成不同的手勢問題。在已實作的教學流程裡，完整手掌抓取用於拿取食物物件，凝視加捏取則用於選單控制。"
      }
    },
    {
      "kind": "text",
      "title": "The Tutorial Teaches the Handoff",
      "paragraphs": [
        {
          "en": "The tutorial starts by asking the player to close a hand around the knife. While still holding it, the player moves the blade through the salmon and exits the fish to complete the cut. The player then releases the knife, picks up a salmon slice, places it on the rice, and rotates the wrist to adjust the fish angle when needed.",
          "zh": "教學先請玩家握住刀具。保持抓取時，玩家把刀刃穿過三文魚，並讓刀刃離開魚身完成切割。接著玩家放下刀，拿起魚片，把魚片放到米飯上；需要時再旋轉手腕調整魚片角度。"
        },
        {
          "en": "After the sushi is merged, the player grasps the finished piece and releases it over a plate. The plate then travels into the SERVE / delivery zone. These steps are driven by the project’s gameplay events, so the page can describe the sequence as implemented interaction rather than as a storyboard only.",
          "zh": "壽司合併後，玩家抓起完成的壽司，將它放到盤子上。盤子接著進入 SERVE／出餐區。這些步驟由專案裡的 gameplay events 驅動，因此本頁可以把它寫成已實作的互動順序，而不只是 storyboard。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Gesture → Result",
      "items": [
        [
          "GRIP",
          "Close the hand to pick up the knife, fish, or finished sushi.",
          "合攏手掌，拿起刀、魚片或完成的壽司。"
        ],
        [
          "CUT",
          "Move the blade through the salmon and out the other side.",
          "讓刀刃穿過三文魚並從另一側離開。"
        ],
        [
          "ROTATE",
          "Rotate the wrist while holding the fish to adjust its yaw.",
          "抓住魚片時旋轉手腕，調整魚片的水平角度。"
        ],
        [
          "PINCH",
          "Use gaze and pinch for menu buttons and setup controls.",
          "用凝視與捏取操作選單按鈕和設定控制。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Size Becomes Reward",
      "paragraphs": [
        {
          "en": "After the fish is placed on the rice, RiceFishEvaluator compares the rendered fish dimensions with an ideal fish size. The current evaluator starts at 5 base money, adds 15 for an error of 10% or less, 10 for an error of 30% or less, and 5 for an error of 50% or less. The reward turns cutting accuracy into part of the service result.",
          "zh": "魚片放到米飯上後，RiceFishEvaluator 會把實際魚片尺寸和理想尺寸比較。目前的評估從 5 點基本金錢開始：誤差不超過 10% 加 15，誤差不超過 30% 加 10，誤差不超過 50% 加 5。這讓切割準確度成為出餐結果的一部分。"
        }
      ]
    },
    {
      "kind": "flow",
      "title": "Serving Sequence",
      "steps": [
        [
          "PICK UP",
          "Take the knife or fish with a full-hand grasp.",
          "用完整手掌抓取拿起刀或魚片。"
        ],
        [
          "PREPARE",
          "Cut the salmon and place it on the rice.",
          "切割三文魚並把魚片放到米飯上。"
        ],
        [
          "PLATE",
          "Release the finished sushi over a plate.",
          "把完成的壽司放到盤子上。"
        ],
        [
          "SERVE",
          "Let the plate enter the delivery zone.",
          "讓盤子進入出餐區。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Scope and Iteration",
      "paragraphs": [
        {
          "en": "The Figma record labels four phases and then notes “All four now,” with a 48-second pass aimed at a 3–5 minute demo experience. That note documents a target and a stage of iteration; it does not provide a measured completion rate or a player study. The tutorial sequence and reward rule are documented. A continuous demo recording is still needed to show the experience at that length.",
          "zh": "Figma 記錄列出四個階段，之後標註「All four now」，並以 48 秒流程作為 3–5 分鐘 demo 體驗的目標。這段文字記錄了迭代目標與階段，不代表完成率或玩家研究結果。教學流程與獎勵規則已有記錄；完整 demo 錄影仍需要展示這個時長下的體驗。"
        },
        {
          "en": "The current verified project materials are the visionOS interaction scripts and the Unity/Figma gesture sources. Deprecated Ultraleap material is not part of this page’s interaction account.",
          "zh": "目前核對到的專案材料是 visionOS 互動腳本，以及 Unity／Figma 的手勢來源。已棄用的 Ultraleap 材料不放入本頁的互動說明。"
        }
      ]
    }
  ],
  "/analog-game": [
    {
      "kind": "copy-grid",
      "title": "Overview and Target Player",
      "left": {
        "title": "Build n Shoot",
        "en": "The fourth-iteration GDD describes Build n Shoot as a turn-based strategy shooting game for up to four players, played on a 15 × 15 grid of floating islands. Players are mages competing for control of ancient land, using arcane resources to construct platforms and bullet-blocking bunkers while marking territory.",
        "zh": "第四版 GDD 把 Build n Shoot 定義為一款最多四人的回合制策略射擊遊戲，發生在由 15 × 15 格組成的浮空島上。玩家扮演爭奪古老土地控制權的法師，用神秘資源建造平台與擋子彈的掩體，同時標記領地。"
      },
      "right": {
        "title": "Target Player",
        "en": "The document names strategy-game enthusiasts, achiever-type and killer-type players, and players who enjoy fantasy and magic themes. Its three game pillars are strategically traversing, building, and shooting.",
        "zh": "文件把策略遊戲愛好者、Achiever 型與 Killer 型玩家，以及喜歡奇幻和魔法題材的玩家列為目標玩家。遊戲的三個支柱是有策略地移動、建造與射擊。"
      }
    },
    {
      "kind": "system-grid",
      "title": "Three Game Pillars",
      "items": [
        [
          "TRAVERSE",
          "Spend movement to claim routes and reach useful positions.",
          "花費移動資源佔據路線並抵達有利位置。"
        ],
        [
          "BUILD",
          "Place blocks and territory marks that change the board.",
          "放置方塊與領地標記，改變棋盤。"
        ],
        [
          "SHOOT",
          "Use position, D6 range, and territory marks to resolve a shot.",
          "利用位置、D6 射程與領地標記結算射擊。"
        ]
      ]
    },
    {
      "kind": "flow",
      "title": "One Turn",
      "steps": [
        [
          "ACTION CARD",
          "Move, shoot, build, use an item, or place a unit.",
          "移動、射擊、建造、使用物品或放置單位。"
        ],
        [
          "SETTLEMENT",
          "Check the surrounding nine grid spaces and collect items.",
          "檢查周圍九格並收集物品。"
        ],
        [
          "AI ACTIVITY",
          "Surviving AI units take one turn according to their behaviour logic.",
          "存活的 AI 單位依照行為邏輯完成一個回合。"
        ],
        [
          "PURCHASE",
          "Spend resource cards on items before the next player begins.",
          "在下一位玩家開始前，用資源卡購買物品。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Position Changes the Shot",
      "paragraphs": [
        {
          "en": "Movement uses a D6 on the square grid, and the player places a territory mark on every grid space they pass through. Passing over another player’s marks overwrites them. A player can climb the blocks they build, but reaching a higher level costs an additional point on the movement roll.",
          "zh": "移動系統在方格棋盤上使用 D6，玩家經過的每一格都會放置自己的領地標記。經過其他玩家的標記時，原本的標記會被覆蓋。玩家可以爬上自己建造的方塊，但抵達更高層需要在移動擲骰上多付一點。"
        },
        {
          "en": "Shooting also starts with a D6. The bullet travels in a straight line, and every one of the player’s territory marks along that line adds one unit to the range. Elevation changes the interaction: a higher player can shoot over lower obstacles, while a lower shot can destroy a block at the higher position.",
          "zh": "射擊同樣從 D6 開始。子彈沿直線移動，沿途每經過一個自己的領地標記，射程就增加一格。高度會改變射擊關係：高處玩家可以越過較低的障礙物射擊，而低處射擊則可以摧毀高處的一個方塊。"
        }
      ]
    },
    {
      "kind": "system-grid",
      "title": "Inventory Weight",
      "items": [
        [
          "10 WEIGHTS",
          "A player can hold up to ten weights of cards and items.",
          "玩家最多持有十個重量單位的卡牌與物品。"
        ],
        [
          "STACKING",
          "Some cards remain one weight until their stack limit is reached.",
          "部分卡牌在達到堆疊上限前仍只算一個重量。"
        ],
        [
          "SURVIVAL",
          "HP and Action cards stay useful, but carrying more of them leaves less room for tactical options.",
          "HP 與行動卡很重要，但帶得越多，就越少空間留給戰術選項。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Fourth Iteration and Playtest Problem",
      "paragraphs": [
        {
          "en": "The fourth iteration revises the AI system to clarify situational mechanics and updates progression around that revision. The GDD records this as a rules change; it does not include a measured before-and-after result for player understanding.",
          "zh": "第四版修訂了 AI 系統，讓情境機制更清楚，並配合這次修訂更新遊戲進程。GDD 把它記錄成規則改動，但沒有提供玩家理解度的改版前後量化結果。"
        },
        {
          "en": "The playtest note says that the basic actions—moving, shooting, and building obstacles—were generally understood. The flow became dense when players had to remember progression rules, and some repeatedly asked the GM how an AI unit should move. The design question is how to keep the strategic turn without making the rules handoff carry the turn for the player.",
          "zh": "測試筆記指出，基礎行動——移動、射擊與建造障礙——大致能被理解。當玩家需要記住進程規則時，流程變得擁擠；有些玩家反覆詢問 GM AI 單位應如何移動。設計問題是如何保留策略回合，同時不要讓 GM 的規則交接代替玩家完成回合。"
        }
      ]
    },
    {
      "kind": "text",
      "title": "Open Test",
      "paragraphs": [
        {
          "en": "The next useful evidence is a short recorded match in which one player explains a complete turn without reopening the rules document. I would compare the explanation with the AI phase, purchase phase, and end-of-turn transition before claiming that the fourth-iteration rules are easier to learn.",
          "zh": "下一份有用的證據，是一段短對局錄影：讓一名玩家不重新打開規則文件，直接說出完整回合。我會把這段說明和 AI 階段、購買階段及回合結束的轉換對照，再決定能不能說第四版規則更容易學習。"
        }
      ]
    }
  ],
  "/curtain": [
    {
      "kind": "copy-grid",
      "title": "The Fragment We Can Verify",
      "left": {
        "title": "Unit and Boundary",
        "en": "The Curtain source page repeats a 5 × 5 unit, a 2 × 5 unit, and a door or curtain arrangement. The diagram language is compact and modular: the units establish the available spatial pieces before the sentence gives them a social situation.",
        "zh": "Curtain 的來源頁面反覆出現 5 × 5 單位、2 × 5 單位，以及門或簾子的排列。圖表語言簡短而模組化：先由單位建立空間元件，再由文字給它們一個社會情境。"
      },
      "right": {
        "title": "The Request",
        "en": "The repeated line is “I’m so cold, may I come in?” It establishes an invitation and a boundary, but the source material does not yet specify a complete player objective, progression, or authored role for the person outside the door.",
        "zh": "反覆出現的句子是「I’m so cold, may I come in?」。它建立了邀請與邊界，但目前來源材料還沒有說明完整的玩家目標、進程，或門外角色的明確身份。"
      }
    },
    {
      "kind": "system-grid",
      "title": "Spatial Vocabulary",
      "items": [
        [
          "5 × 5 UNIT",
          "A repeated square spatial unit shown in the diagram set.",
          "圖表中反覆出現的方形空間單位。"
        ],
        [
          "2 × 5 UNIT",
          "A narrower unit used beside the larger block in the source layouts.",
          "來源版面中與較大方塊並列的狹長單位。"
        ],
        [
          "DOOR / CURTAIN",
          "The boundary element that gives the request a place to happen.",
          "讓邀請發生在某個位置上的邊界元素。"
        ],
        [
          "REQUEST",
          "“I’m so cold, may I come in?”—the only fully written narrative prompt in the extracted page.",
          "「我好冷，可以讓我進來嗎？」——目前抽取頁面中唯一完整寫出的敘事提示。"
        ]
      ]
    },
    {
      "kind": "flow",
      "title": "Reading the Spatial Study",
      "steps": [
        [
          "UNIT",
          "Read the 5 × 5 and 2 × 5 spatial pieces.",
          "閱讀 5 × 5 與 2 × 5 的空間單位。"
        ],
        [
          "BOUNDARY",
          "Locate the door or curtain in the arrangement.",
          "在排列中找到門或簾子的邊界。"
        ],
        [
          "REQUEST",
          "Read the invitation attached to that boundary.",
          "閱讀附著在邊界上的邀請。"
        ],
        [
          "ACTION",
          "The complete player response still needs a matching walkthrough.",
          "完整玩家回應仍需要對應的操作示範。"
        ]
      ]
    },
    {
      "kind": "text",
      "title": "Current Build Boundary",
      "paragraphs": [
        {
          "en": "A Unity/WebGL prototype is available below. The design drawings establish the spatial units, the boundary, and the request at the door. A matching walkthrough is still needed to explain the player’s complete objective, response, and result.",
          "zh": "下方提供 Unity／WebGL 原型。設計圖確立了空間單位、邊界，以及門外的請求；完整的玩家目標、回應與結果，仍需要一段對應的操作示範來說明。"
        }
      ]
    }
  ]
}
