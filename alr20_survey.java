package mil.af.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ALR20_SURVEY")
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_survey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SURVEY_ID")
    private Long id;

    @OneToMany(mappedBy = "survey", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<alr20_recognition_path> recognitionPathList = new ArrayList<>();

    /** 인지경로 기타 항목 직접 입력 (최대 30자) */
    @Column(name = "ETC_DESCRIPTION", length = 30)
    private String etcDescription;
}
